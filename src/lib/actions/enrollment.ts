'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function checkEnrollmentStatus(courseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { enrolled: false };
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId,
            },
        },
    });

    return { enrolled: !!enrollment, enrollment };
}

export async function enrollInCourse(courseId: string, inviteToken?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'You must be logged in to enroll' };
    }

    // Fetch course
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course || !course.published || course.deletedAt) {
        return { error: 'Course not found or not available' };
    }

    // Check for duplicate enrollment
    const existing = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId,
            },
        },
    });

    if (existing) {
        return { error: 'You are already enrolled in this course' };
    }

    // Access validation based on accessType
    if (course.accessType === 'INVITE') {
        if (!inviteToken) {
            return { error: 'This course requires an invitation' };
        }

        // Verify invitation token
        const invitation = await prisma.invitation.findFirst({
            where: {
                token: inviteToken,
                courseId,
                status: 'PENDING',
                expiresAt: { gt: new Date() },
            },
        });

        if (!invitation) {
            return { error: 'Invalid or expired invitation' };
        }

        // Mark invitation as accepted
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' },
        });
    } else if (course.accessType === 'PAID') {
        // Payment should be handled before calling this
        // This is just a safety check
        return { error: 'Payment required for this course' };
    }

    // Create enrollment
    try {
        await prisma.enrollment.create({
            data: {
                userId: session.user.id,
                courseId,
            },
        });

        revalidatePath('/learner/dashboard');
        revalidatePath(`/learner/course/${courseId}`);

        return { success: true };
    } catch (error) {
        return { error: 'Failed to enroll in course' };
    }
}

export async function mockPayment(courseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'You must be logged in' };
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course || course.accessType !== 'PAID') {
        return { error: 'Invalid course' };
    }

    // Mock payment - in real app, this would integrate with payment gateway
    // For now, just create the enrollment directly
    try {
        const existing = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId,
                },
            },
        });

        if (existing) {
            return { error: 'Already enrolled' };
        }

        await prisma.enrollment.create({
            data: {
                userId: session.user.id,
                courseId,
            },
        });

        revalidatePath('/learner/dashboard');
        revalidatePath(`/learner/course/${courseId}`);

        return { success: true };
    } catch (error) {
        return { error: 'Payment failed' };
    }
}
