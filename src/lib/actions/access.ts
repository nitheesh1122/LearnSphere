'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function generateInvitation(email: string, roleName: 'INSTRUCTOR' | 'LEARNER', courseId?: string) {
    const session = await auth();
    // Only Admin or Instructor can invite
    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR')) {
        return { error: 'Unauthorized' };
    }

    // Instructors can only invite to their own courses
    if (session.user.role === 'INSTRUCTOR' && !courseId) {
        return { error: 'Instructors must specify a course.' };
    }

    if (courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId, instructorId: session.user.id },
        });
        if (!course && session.user.role !== 'ADMIN') {
            return { error: 'Course not found or unauthorized.' };
        }
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    try {
        await prisma.invitation.create({
            data: {
                email,
                roleName,
                courseId, // Optional
                token,
                expiresAt,
                inviterId: session.user.id,
            },
        });
        return { success: true, token }; // In real app, send email here
    } catch (error) {
        return { error: 'Failed to create invitation.' };
    }
}

export async function acceptInvitation(token: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Must be logged in to accept invitation.' };
    }

    const invitation = await prisma.invitation.findUnique({ where: { token } });

    if (!invitation) return { error: 'Invalid token.' };
    if (invitation.status !== 'PENDING') return { error: 'Invitation already used.' };
    if (new Date() > invitation.expiresAt) return { error: 'Invitation expired.' };
    if (invitation.email !== session.user.email) return { error: 'Email mismatch.' };

    try {
        await prisma.$transaction(async (tx) => {
            // Update invitation status
            await tx.invitation.update({
                where: { id: invitation.id },
                data: { status: 'ACCEPTED' },
            });

            // Grant Role if needed (should be handled by specialized logic, but for now generic)
            // Note: Users have roles in UserRole table.

            // If course invite, enroll user
            if (invitation.courseId) {
                // Check if already enrolled
                const existingEnrollment = await tx.enrollment.findUnique({
                    where: {
                        userId_courseId: {
                            userId: session.user.id,
                            courseId: invitation.courseId,
                        },
                    },
                });

                if (!existingEnrollment) {
                    await tx.enrollment.create({
                        data: {
                            userId: session.user.id,
                            courseId: invitation.courseId,
                        },
                    });
                }
            }
        });

        return { success: true };
    } catch (error) {
        return { error: 'Failed to process invitation.' };
    }
}

export async function canAccessCourse(userId: string, courseId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } },
    });

    if (!user) return false;

    // Admin passes
    const isAdmin = user.roles.some((r) => r.role.name === 'ADMIN');
    if (isAdmin) return true;

    // Course owner passes
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (course?.instructorId === userId) return true;

    // Enrolled user passes
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId,
                courseId,
            },
        },
    });

    return !!enrollment;
}
