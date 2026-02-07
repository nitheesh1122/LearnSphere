'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function checkCourseCompletion(courseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Get all non-hidden lessons
        const allLessons = await prisma.courseContent.findMany({
            where: {
                courseId,
                hidden: false,
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        passingScore: true,
                    },
                },
            },
        });

        // Get user's progress
        const completedLessons = await prisma.contentProgress.findMany({
            where: {
                userId: session.user.id,
                contentId: { in: allLessons.map((l: typeof allLessons[number]) => l.id) },
                isCompleted: true,
            },
        });

        // Check quiz requirements
        for (const lesson of allLessons) {
            if (lesson.type === 'QUIZ' && lesson.quiz) {
                const passedAttempts = await prisma.quizAttempt.findMany({
                    where: {
                        userId: session.user.id,
                        quizId: lesson.quiz.id,
                        score: { gte: lesson.quiz.passingScore },
                    },
                });

                if (passedAttempts.length === 0) {
                    return {
                        completed: false,
                        reason: `Quiz "${lesson.title}" must be passed`
                    };
                }
            }
        }

        const isComplete = completedLessons.length === allLessons.length;

        return {
            completed: isComplete,
            progress: {
                completed: completedLessons.length,
                total: allLessons.length,
            },
        };
    } catch (error) {
        return { error: 'Failed to check completion status' };
    }
}

export async function generateCertificate(courseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check if course is completed
        const completionCheck = await checkCourseCompletion(courseId);
        if (!completionCheck.completed) {
            return { error: 'Course not completed yet' };
        }

        // Get enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId,
                },
            },
            include: {
                course: true,
                user: true,
            },
        });

        if (!enrollment) {
            return { error: 'Not enrolled in this course' };
        }

        // Mark enrollment as completed if not already
        if (!enrollment.completedAt) {
            await prisma.enrollment.update({
                where: {
                    userId_courseId: {
                        userId: session.user.id,
                        courseId,
                    },
                },
                data: {
                    completedAt: new Date(),
                },
            });
        }

        // Check if certificate already exists
        let certificate = await prisma.certificate.findFirst({
            where: {
                userId: session.user.id,
                courseId,
            },
        });

        if (!certificate) {
            // Create certificate record
            certificate = await prisma.certificate.create({
                data: {
                    userId: session.user.id,
                    courseId,
                    pdfUrl: '', // Placeholder, can be updated later
                    issuedAt: new Date(),
                },
            });
        }

        revalidatePath(`/learner/learn/${courseId}`);

        return {
            success: true,
            certificate: {
                id: certificate.id,
                issuedAt: certificate.issuedAt,
            },
        };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to generate certificate' };
    }
}

export async function verifyCertificate(certificateId: string) {
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!certificate) {
            return { valid: false };
        }

        // Fetch course separately since there's no direct relation
        const course = await prisma.course.findUnique({
            where: { id: certificate.courseId },
            select: {
                title: true,
                instructor: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!course) {
            return { valid: false };
        }

        return {
            valid: true,
            certificate: {
                certificateId: certificate.id,
                userName: certificate.user.name || 'Unknown',
                courseName: course.title,
                instructorName: course.instructor.name || 'Unknown',
                issuedAt: certificate.issuedAt,
            },
        };
    } catch (error) {
        return { valid: false };
    }
}
