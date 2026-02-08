'use server';

import prisma from '../prisma';
import { auth } from '@/auth';

export async function getCourseAnalytics(courseId: string) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
            instructorId: session.user.id,
        },
    });

    if (!course) {
        throw new Error('Course not found');
    }

    // Fetch enrollments
    const totalEnrollments = await prisma.enrollment.count({
        where: { courseId },
    });

    const completedEnrollments = await prisma.enrollment.count({
        where: {
            courseId,
            completedAt: { not: null },
        },
    });

    // Fetch content count
    const totalLessons = await prisma.courseContent.count({
        where: { courseId },
    });

    // Fetch quiz attempts
    const quizAttempts = await prisma.quizAttempt.findMany({
        where: {
            quiz: {
                content: {
                    courseId,
                },
            },
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            quiz: {
                select: {
                    passingScore: true,
                    content: {
                        select: {
                            title: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            completedAt: 'desc',
        },
        take: 10,
    });

    // Calculate average quiz score
    const completedAttempts = quizAttempts.filter(a => a.completedAt);
    const avgQuizScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length)
        : 0;

    // Fetch student progress
    const studentProgress = await prisma.enrollment.findMany({
        where: { courseId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        take: 20,
        orderBy: {
            enrolledAt: 'desc',
        },
    });

    // Calculate progress for each student
    const studentsWithProgress = await Promise.all(
        studentProgress.map(async (enrollment) => {
            const completedContent = await prisma.contentProgress.count({
                where: {
                    userId: enrollment.user.id,
                    content: {
                        courseId,
                    },
                    isCompleted: true,
                },
            });

            const progressPercentage = totalLessons > 0
                ? Math.round((completedContent / totalLessons) * 100)
                : 0;

            return {
                ...enrollment,
                completedContent,
                totalContent: totalLessons,
                progressPercentage,
            };
        })
    );

    return {
        overview: {
            totalEnrollments,
            completedEnrollments,
            completionRate: totalEnrollments > 0
                ? Math.round((completedEnrollments / totalEnrollments) * 100)
                : 0,
            views: course.views,
            totalLessons,
            avgQuizScore,
        },
        recentQuizAttempts: quizAttempts,
        studentProgress: studentsWithProgress,
    };
}
