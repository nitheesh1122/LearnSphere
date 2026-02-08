'use server';

import { z } from 'zod';
import { CourseFormSchema } from '../definitions';
import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCourse(data: z.infer<typeof CourseFormSchema>) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    const validatedFields = CourseFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    const { title, description, price, published, accessType, tags, website, level, visibility, responsibleId, imageUrl, previewVideoUrl } = validatedFields.data;

    // Parse tags from comma-separated string if needed, or assume frontend sends array?
    // Zod definition says string, so we need to split it if we want array in DB.
    // Wait, schema says tags String[]. 
    // Let's adjust Zod to be string and we split here.
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    try {
        const course = await prisma.course.create({
            data: {
                title,
                description,
                instructorId: session.user.id,
                published,
                price,
                accessType,
                tags: tagsArray,
                website: website || null,
                level,
                visibility,
                responsibleId: responsibleId || null,
                imageUrl,
                previewVideoUrl,
            },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { error: `Course creation failed: ${errorMessage}` };
    }

    revalidatePath('/instructor/courses');
    redirect('/instructor/courses');
}

export async function updateCourse(id: string, data: z.infer<typeof CourseFormSchema>) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    const validatedFields = CourseFormSchema.safeParse(data);

    if (!validatedFields.success) {
        return { error: 'Invalid fields' };
    }

    try {
        const { tags, website, responsibleId, ...rest } = validatedFields.data;
        const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

        await prisma.course.update({
            where: { id, instructorId: session.user.id },
            data: {
                ...rest,
                website: website || null,
                responsibleId: responsibleId || null,
                tags: tagsArray
            },
        });
    } catch (error) {
        return { error: 'Failed to update course.' };
    }

    revalidatePath(`/instructor/courses/${id}/edit`);
    revalidatePath('/instructor/courses');
}

export async function deleteCourse(id: string) {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'INSTRUCTOR') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.course.update({
            where: { id, instructorId: session.user.id },
            data: { deletedAt: new Date() },
        });
    } catch (error) {
        return { error: 'Failed to delete course.' };
    }

    revalidatePath('/instructor/courses');
}

export async function getInstructorCourses() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const courses = await prisma.course.findMany({
            where: {
                instructorId: session.user.id,
                deletedAt: null,
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { contents: true },
                },
            },
        });
        return courses;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to fetch courses:', errorMessage);
        return [];
    }
}
