'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function submitQuizAttemptEnhanced(attemptId: string, answers: Record<string, string[]>) {
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
                            orderBy: {
                                order: 'asc',
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

        // Enhanced scoring logic
        let correctAnswers = 0;
        let totalPossiblePoints = 0;
        const results = [];

        for (const question of attempt.quiz.questions) {
            const userAnswers = answers[question.id] || [];
            const correctAnswerIds = question.answers
                .filter((a: any) => a.isCorrect)
                .map((a: any) => a.id);

            let isCorrect = false;
            let pointsEarned = 0;

            // Different scoring logic for different question types
            switch (question.type) {
                case 'MULTIPLE_CHOICE':
                case 'TRUE_FALSE':
                    // Exact match required
                    isCorrect = userAnswers.length === correctAnswerIds.length &&
                        userAnswers.every(id => correctAnswerIds.includes(id));
                    pointsEarned = isCorrect ? question.points : 0;
                    break;

                case 'SHORT_ANSWER':
                    // Case-insensitive partial matching
                    const userAnswer = userAnswers[0] || '';
                    const correctAnswers = question.answers
                        .filter((a: any) => a.isCorrect)
                        .map((a: any) => a.text.toLowerCase().trim());
                    
                    isCorrect = correctAnswers.some(correct => 
                        userAnswer.toLowerCase().trim().includes(correct.toLowerCase().trim())
                    );
                    pointsEarned = isCorrect ? question.points : 0;
                    break;

                case 'ESSAY':
                    // Essay questions require manual grading
                    // For now, award full points if attempt is made
                    isCorrect = userAnswers.length > 0 && userAnswers[0].trim().length > 10;
                    pointsEarned = isCorrect ? question.points : 0;
                    break;

                default:
                    isCorrect = false;
                    pointsEarned = 0;
            }

            if (isCorrect) {
                correctAnswers++;
            }

            totalPossiblePoints += question.points;

            results.push({
                questionId: question.id,
                questionText: question.text,
                questionType: question.type,
                userAnswer: userAnswers,
                correctAnswer: correctAnswerIds,
                isCorrect,
                pointsEarned,
                pointsPossible: question.points,
            });
        }

        const scorePercentage = totalPossiblePoints > 0 
            ? Math.round((results.reduce((sum, r) => sum + r.pointsEarned, 0) / totalPossiblePoints) * 100)
            : 0;

        const passed = scorePercentage >= attempt.quiz.passingScore;

        // Update attempt with enhanced data
        await prisma.quizAttempt.update({
            where: { id: attemptId },
            data: {
                score: scorePercentage,
                completedAt: new Date(),
                // Store detailed results as JSON
                results: JSON.stringify(results),
            },
        });

        // If passed, mark content as complete with detailed progress
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
                    // Store detailed results
                    results: JSON.stringify(results),
                },
                create: {
                    userId: session.user.id,
                    contentId: attempt.quiz.contentId,
                    isCompleted: true,
                    score: scorePercentage,
                    lastAccessedAt: new Date(),
                    results: JSON.stringify(results),
                },
            });
        }

        revalidatePath(`/learner/learn/${attempt.quiz.content.courseId}`);

        return {
            success: true,
            score: scorePercentage,
            passed,
            correctAnswers,
            totalQuestions: attempt.quiz.questions.length,
            results,
            totalPoints: totalPossiblePoints,
            earnedPoints: results.reduce((sum, r) => sum + r.pointsEarned, 0),
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { error: `Quiz submission failed: ${errorMessage}` };
    }
}

export async function getQuizResults(attemptId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const attempt = await prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                quiz: {
                    include: {
                        questions: {
                            include: {
                                answers: true,
                            },
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                },
            },
        });

        if (!attempt || attempt.userId !== session.user.id) {
            return { error: 'Invalid attempt' };
        }

        // Parse stored results
        const results = attempt.results ? JSON.parse(attempt.results) : [];

        return {
            success: true,
            attempt: {
                id: attempt.id,
                score: attempt.score,
                completedAt: attempt.completedAt,
                passed: attempt.score >= attempt.quiz.passingScore,
            },
            quiz: {
                id: attempt.quiz.id,
                title: attempt.quiz.content?.title || 'Quiz',
                passingScore: attempt.quiz.passingScore,
                totalQuestions: attempt.quiz.questions.length,
            },
            results,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { error: `Failed to get quiz results: ${errorMessage}` };
    }
}

export async function retakeQuiz(attemptId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check if user can retake (time limit, attempt limit, etc.)
        const existingAttempts = await prisma.quizAttempt.findMany({
            where: {
                userId: session.user.id,
                quizId: (await prisma.quizAttempt.findUnique({
                    where: { id: attemptId },
                    select: { quizId: true },
                }))?.quizId,
            },
            orderBy: {
                completedAt: 'desc',
            },
        });

        // Allow max 3 attempts per quiz
        if (existingAttempts.length >= 3) {
            return { error: 'Maximum attempt limit reached (3 attempts)' };
        }

        // Check if last attempt was less than 1 hour ago
        const lastAttempt = existingAttempts[0];
        if (lastAttempt && lastAttempt.completedAt) {
            const timeSinceLastAttempt = new Date().getTime() - new Date(lastAttempt.completedAt).getTime();
            const oneHour = 60 * 60 * 1000; // milliseconds in an hour
            
            if (timeSinceLastAttempt < oneHour) {
                return { error: 'Please wait 1 hour before retaking the quiz' };
            }
        }

        // Create new attempt
        const newAttempt = await prisma.quizAttempt.create({
            data: {
                userId: session.user.id,
                quizId: (await prisma.quizAttempt.findUnique({
                    where: { id: attemptId },
                    select: { quizId: true },
                }))?.quizId,
                score: 0,
            },
        });

        revalidatePath(`/learner/quiz/${newAttempt.id}`);

        return {
            success: true,
            attemptId: newAttempt.id,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { error: `Quiz retake failed: ${errorMessage}` };
    }
}
