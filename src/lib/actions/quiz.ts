'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

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
        console.error(error);
        return { error: 'Failed to submit quiz' };
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
