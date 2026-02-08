'use server';

import { z } from 'zod';
import { LessonFormSchema } from '../definitions';
import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function createLesson(courseId: string, data: z.infer<typeof LessonFormSchema>) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
        where: { id: courseId, instructorId: session.user.id },
    });

    if (!course) {
        throw new Error('Course not found or unauthorized');
    }

    const validatedFields = LessonFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    const { title, type, hidden, contentUrl, description, attachments, isPreview } = validatedFields.data;

    // If this lesson is marked as preview, unmark all other lessons
    if (isPreview) {
        await prisma.courseContent.updateMany({
            where: { courseId, isPreview: true },
            data: { isPreview: false },
        });
    }

    // Get max order
    const lastLesson = await prisma.courseContent.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
    });

    const newOrder = (lastLesson?.order ?? 0) + 1;

    try {
        const lesson = await prisma.courseContent.create({
            data: {
                courseId,
                title,
                type,
                hidden,
                order: newOrder,
                contentUrl: type === 'TEXT' ? description : contentUrl,
                isPreview: isPreview || false,
                attachments: attachments ? JSON.parse(attachments) : undefined, // Parse JSON string
            },
        });

        // If this is a quiz lesson, create a corresponding quiz record
        if (type === 'QUIZ') {
            console.log('Creating quiz record for lesson:', lesson.id);
            try {
                const quiz = await prisma.quiz.create({
                    data: {
                        contentId: lesson.id,
                        passingScore: 70, // Default passing score
                    },
                });
                console.log('Quiz created successfully:', quiz.id);
            } catch (quizError) {
                console.error('Failed to create quiz record:', quizError);
                return { error: 'Failed to create quiz record' };
            }
        }
    } catch (error) {
        return { error: 'Failed to create lesson' };
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function updateLesson(courseId: string, lessonId: string, data: z.infer<typeof LessonFormSchema>) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    // Verify course ownership logic via nested query or separate check.
    // Efficient way: updateMany with instructorId check on relation? No, raw update limited.
    // Use findFirst then update.

    const lesson = await prisma.courseContent.findFirst({
        where: {
            id: lessonId,
            courseId,
            course: { instructorId: session.user.id },
        },
    });

    if (!lesson) {
        return { error: 'Lesson not found' };
    }

    const validatedFields = LessonFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        const { attachments, isPreview, description, contentUrl, type, ...rest } = validatedFields.data;

        // If this lesson is marked as preview, unmark all other lessons
        if (isPreview) {
            await prisma.courseContent.updateMany({
                where: { courseId, isPreview: true, NOT: { id: lessonId } },
                data: { isPreview: false },
            });
        }

        // For TEXT type, we store the description (markdown) in contentUrl
        const finalContentUrl = type === 'TEXT' ? description : contentUrl;

        await prisma.courseContent.update({
            where: { id: lessonId },
            data: {
                ...rest,
                type,
                contentUrl: finalContentUrl,
                isPreview: isPreview || false,
                attachments: attachments ? JSON.parse(attachments) : undefined
            },
        });

    } catch (error) {
        return { error: 'Failed to update lesson' };
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function deleteLesson(courseId: string, lessonId: string) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    const lesson = await prisma.courseContent.findFirst({
        where: {
            id: lessonId,
            courseId,
            course: { instructorId: session.user.id },
        },
    });

    if (!lesson) {
        return { error: 'Lesson not found' };
    }

    try {
        await prisma.courseContent.delete({
            where: { id: lessonId },
        });
        // Optional: Reorder remaining lessons? Or just leave gaps. Gaps are fine for now.
    } catch (error) {
        return { error: 'Failed to delete lesson' };
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);
}

export async function reorderLesson(courseId: string, lessonId: string, direction: 'up' | 'down') {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    const lesson = await prisma.courseContent.findFirst({
        where: {
            id: lessonId,
            courseId,
            course: { instructorId: session.user.id },
        },
    });

    if (!lesson) {
        return { error: 'Lesson not found' };
    }

    const currentOrder = lesson.order;

    let swapTarget;
    if (direction === 'up') {
        swapTarget = await prisma.courseContent.findFirst({
            where: {
                courseId,
                order: { lt: currentOrder },
            },
            orderBy: { order: 'desc' },
        });
    } else {
        swapTarget = await prisma.courseContent.findFirst({
            where: {
                courseId,
                order: { gt: currentOrder },
            },
            orderBy: { order: 'asc' },
        });
    }

    if (!swapTarget) {
        return; // Can't move further
    }

    // Transaction for atomic swap
    try {
        await prisma.$transaction([
            prisma.courseContent.update({
                where: { id: lessonId },
                data: { order: swapTarget.order },
            }),
            prisma.courseContent.update({
                where: { id: swapTarget.id },
                data: { order: currentOrder },
            }),
        ]);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Lesson reorder failed:', errorMessage);
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);
}
