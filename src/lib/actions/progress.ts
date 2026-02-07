'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function markLessonComplete(lessonId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // Get lesson details
        const lesson = await prisma.courseContent.findUnique({
            where: { id: lessonId },
            include: {
                course: true,
            },
        });

        if (!lesson) {
            return { error: 'Lesson not found' };
        }

        // Check enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: lesson.courseId,
                },
            },
        });

        if (!enrollment) {
            return { error: 'Not enrolled in this course' };
        }

        // Create or update progress
        await prisma.contentProgress.upsert({
            where: {
                userId_contentId: {
                    userId: session.user.id,
                    contentId: lessonId,
                },
            },
            update: {
                isCompleted: true,
                lastAccessedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                contentId: lessonId,
                isCompleted: true,
                lastAccessedAt: new Date(),
            },
        });

        // Check if course is now complete
        await checkAndMarkCourseComplete(lesson.courseId, session.user.id);

        revalidatePath(`/learner/learn/${lesson.courseId}`);
        revalidatePath(`/learner/dashboard`);

        return { success: true };
    } catch (error) {
        return { error: 'Failed to mark lesson as complete' };
    }
}

export async function trackLessonAccess(lessonId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return;
    }

    try {
        await prisma.contentProgress.upsert({
            where: {
                userId_contentId: {
                    userId: session.user.id,
                    contentId: lessonId,
                },
            },
            update: {
                lastAccessedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                contentId: lessonId,
                isCompleted: false,
                lastAccessedAt: new Date(),
            },
        });
    } catch (error) {
        // Silent fail for tracking
    }
}

async function checkAndMarkCourseComplete(courseId: string, userId: string) {
    // Get all mandatory lessons
    const allLessons = await prisma.courseContent.findMany({
        where: {
            courseId,
            hidden: false,
        },
        select: {
            id: true,
            type: true,
        },
    });

    // Get completed lessons
    const completedLessons = await prisma.contentProgress.findMany({
        where: {
            userId,
            contentId: { in: allLessons.map((l: { id: string; type: string }) => l.id) },
            isCompleted: true,
        },
    });

    // Check if all lessons are completed
    if (completedLessons.length === allLessons.length) {
        await prisma.enrollment.update({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            data: {
                completedAt: new Date(),
            },
        });
    }
}
