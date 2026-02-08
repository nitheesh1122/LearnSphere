'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { recordLearningActivity } from './activity';

export async function startQuizAttempt(quizId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: session.user.id,
                quizId,
                score: 0,
            },
        });

        return { success: true, attemptId: attempt.id };
    } catch (error) {
        return { error: 'Failed to start quiz attempt' };
    }
}

export async function submitQuizAttempt(attemptId: string, answers: Record<string, string[]>) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Fetch attempt with quiz and questions
        const attempt = await prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            include: {
                                answers: true,
                            },
                        },
                        content: true,
                    },
                },
            },
        });

        if (!attempt || attempt.userId !== session.user.id) {
            return { error: 'Invalid attempt' };
        }

        if (attempt.completedAt) {
            return { error: 'Attempt already submitted' };
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = attempt.quiz.questions.length;

        attempt.quiz.questions.forEach((question: any) => {
            const userAnswers = answers[question.id] || [];
            const correctAnswerIds = question.answers
                .filter((a: any) => a.isCorrect)
                .map((a: any) => a.id);

            // Check if user selected exactly the correct answers
            const isCorrect =
                userAnswers.length === correctAnswerIds.length &&
                userAnswers.every(id => correctAnswerIds.includes(id));

            if (isCorrect) {
                correctAnswers++;
            }
        });

        const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
        const passed = scorePercentage >= attempt.quiz.passingScore;

        // Update attempt
        await prisma.quizAttempt.update({
            where: { id: attemptId },
            data: {
                score: scorePercentage,
                completedAt: new Date(),
            },
        });

        // Record activity
        await recordLearningActivity(session.user.id, 'QUIZ_ATTEMPT');

        // If passed, mark content as complete
        if (passed) {
            await prisma.contentProgress.upsert({
                where: {
                    userId_contentId: {
                        userId: session.user.id,
                        contentId: attempt.quiz.contentId,
                    },
                },
                update: {
                    isCompleted: true,
                    score: scorePercentage,
                    lastAccessedAt: new Date(),
                },
                create: {
                    userId: session.user.id,
                    contentId: attempt.quiz.contentId,
                    isCompleted: true,
                    score: scorePercentage,
                    lastAccessedAt: new Date(),
                },
            });
        }

        revalidatePath(`/learner/learn/${attempt.quiz.content.courseId}`);

        return {
            success: true,
            score: scorePercentage,
            passed,
            correctAnswers,
            totalQuestions,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { error: `Quiz submission failed: ${errorMessage}` };
    }
}

export async function saveQuiz(quizId: string, data: { questions: any[], passingScore: number }) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        return { error: 'Unauthorized' };
    }

    try {
        // Verify quiz ownership
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                content: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        if (!quiz || quiz.content.course.instructorId !== session.user.id) {
            return { error: 'Quiz not found or unauthorized' };
        }

        // Delete existing questions and answers
        await prisma.answer.deleteMany({
            where: {
                question: {
                    quizId: quizId,
                },
            },
        });

        await prisma.question.deleteMany({
            where: { quizId: quizId },
        });

        // Create new questions and answers
        for (const question of data.questions) {
            const createdQuestion = await prisma.question.create({
                data: {
                    quizId: quizId,
                    text: question.text,
                    type: question.type,
                    points: question.points,
                    order: question.order || 0,
                },
            });

            // Create answers for this question
            if (question.answers && question.answers.length > 0) {
                await prisma.answer.createMany({
                    data: question.answers.map((answer: any) => ({
                        questionId: createdQuestion.id,
                        text: answer.text,
                        isCorrect: answer.isCorrect || false,
                    })),
                });
            }
        }

        // Update quiz passing score
        await prisma.quiz.update({
            where: { id: quizId },
            data: {
                passingScore: data.passingScore,
            },
        });

        revalidatePath(`/instructor/courses/${quiz.content.courseId}/quiz/${quizId}`);
        revalidatePath(`/instructor/courses/${quiz.content.courseId}/edit`);

        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { error: `Failed to save quiz: ${errorMessage}` };
    }
}

export async function getQuizAttempts(quizId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const attempts = await prisma.quizAttempt.findMany({
        where: {
            quizId,
            userId: session.user.id,
            completedAt: { not: null },
        },
        orderBy: {
            completedAt: 'desc',
        },
    });

    return { attempts };
}

export async function updateQuizQuestions(
    quizId: string,
    data: {
        passingScore: number;
        questions: any[];
    }
) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    // Verify ownership via quiz -> content -> course -> instructor
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            content: {
                include: {
                    course: true,
                },
            },
        },
    });

    if (!quiz || quiz.content.course.instructorId !== session.user.id) {
        throw new Error('Unauthorized');
    }

    try {
        // Transaction to update quiz and replace questions
        await prisma.$transaction(async (tx) => {
            // Update quiz settings
            await tx.quiz.update({
                where: { id: quizId },
                data: { passingScore: data.passingScore },
            });

            // Delete existing questions (cascade deletes answers)
            // Ideally we'd update existing ones to preserve IDs for stats, but efficient replacement is easier for now.
            // For V1, we replace all.
            await tx.question.deleteMany({
                where: { quizId },
            });

            // Create new questions
            for (const [index, q] of data.questions.entries()) {
                await tx.question.create({
                    data: {
                        quizId,
                        text: q.text,
                        type: q.type,
                        points: q.points,
                        order: index, // Ensure order is preserved
                        answers: {
                            create: q.answers.map((a: any) => ({
                                text: a.text,
                                isCorrect: a.isCorrect,
                            })),
                        },
                    },
                });
            }
        });

        revalidatePath(`/instructor/courses/${quiz.content.courseId}/quiz/${quizId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to update quiz:', error);
        return { error: 'Failed to update quiz' };
    }
}
