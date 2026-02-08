'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function checkEnrollmentStatus(courseId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        console.log('No user session found');
        return { enrolled: false };
    }

    console.log('Checking enrollment for user:', session.user.id, 'in course:', courseId);

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId,
            },
        },
    });

    console.log('Found enrollment:', enrollment);
    return { enrolled: !!enrollment, enrollment };
}

export async function enrollInCourse(courseId: string, inviteToken?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        console.log('❌ Enrollment: No user session');
        return { error: 'You must be logged in to enroll' };
    }

    console.log('🎓 Enrollment: Starting enrollment for user:', session.user.id, 'in course:', courseId);

    // Fetch course
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course || !course.published || course.deletedAt) {
        console.log('❌ Enrollment: Course not found or not available', { courseId, published: course?.published, deletedAt: course?.deletedAt });
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
        console.log('❌ Enrollment: User already enrolled', { enrollmentId: existing.id });
        return { error: 'You are already enrolled in this course' };
    }

    // Access validation based on accessType
    if (course.accessType === 'INVITE') {
        if (!inviteToken) {
            console.log('❌ Enrollment: Invitation required but not provided');
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
            console.log('❌ Enrollment: Invalid or expired invitation', { token: inviteToken });
            return { error: 'Invalid or expired invitation' };
        }

        // Mark invitation as accepted
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: 'ACCEPTED' },
        });
        console.log('✅ Enrollment: Invitation accepted', { invitationId: invitation.id });
    } else if (course.accessType === 'PAID') {
        // Payment should be handled before calling this
        // This is just a safety check
        console.log('❌ Enrollment: Payment required for paid course');
        return { error: 'Payment required for this course' };
    }

    // Create enrollment
    try {
        console.log('🔄 Enrollment: Creating enrollment record...');
        const newEnrollment = await prisma.enrollment.create({
            data: {
                userId: session.user.id,
                courseId,
            },
        });
        console.log('✅ Enrollment: Created successfully', { enrollmentId: newEnrollment.id, enrolledAt: newEnrollment.enrolledAt });

        // Revalidate all relevant paths
        revalidatePath('/learner/dashboard');
        revalidatePath(`/learner/course/${courseId}`);
        revalidatePath(`/courses/${courseId}`);
        revalidatePath('/learner/catalog');

        return { success: true, enrollmentId: newEnrollment.id };
    } catch (error) {
        console.error('❌ Enrollment: Creation failed', error);
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
        revalidatePath(`/courses/${courseId}`);
        revalidatePath('/learner/catalog');

        return { success: true };
    } catch (error) {
        return { error: 'Payment failed' };
    }
}
