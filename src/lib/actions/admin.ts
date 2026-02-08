'use server';

import prisma from '../prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getAdminStats() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    try {
        const [
            totalUsers,
            totalInstructors,
            totalLearners,
            totalCourses,
            publishedCourses,
            draftCourses,
            totalEnrollments
        ] = await prisma.$transaction([
            prisma.user.count(),
            prisma.user.count({ where: { roles: { some: { role: { name: 'INSTRUCTOR' } } } } }),
            prisma.user.count({ where: { roles: { some: { role: { name: 'LEARNER' } } } } }),
            prisma.course.count({ where: { deletedAt: null } }),
            prisma.course.count({ where: { published: true, deletedAt: null } }),
            prisma.course.count({ where: { published: false, deletedAt: null } }),
            prisma.enrollment.count(),
        ]);

        return {
            totalUsers,
            totalInstructors,
            totalLearners,
            totalCourses,
            publishedCourses,
            draftCourses,
            totalEnrollments
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Admin stats fetch failed:', errorMessage);
        return {
            totalUsers: 0,
            totalInstructors: 0,
            totalLearners: 0,
            totalCourses: 0,
            publishedCourses: 0,
            draftCourses: 0,
            totalEnrollments: 0
        };
    }
}

export async function getUsers() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        const users = await prisma.user.findMany({
            include: { roles: { include: { role: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return users;
    } catch (error) {
        return [];
    }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
        revalidatePath('/admin/users');
    } catch (error) {
        throw new Error('Failed to update user status');
    }
}

export async function getAllCourses() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        const courses = await prisma.course.findMany({
            where: { deletedAt: null },
            include: {
                instructor: { select: { name: true, email: true } },
                _count: { select: { contents: true, enrollments: true } }
            },
            orderBy: { createdAt: 'desc' },
        });
        return courses;
    } catch (error) {
        return [];
    }
}

export async function adminTogglePublish(courseId: string, isPublished: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        await prisma.course.update({
            where: { id: courseId },
            data: { published: isPublished },
        });
        revalidatePath('/admin/courses');
    } catch (error) {
        throw new Error('Failed to update course status');
    }
}

export async function adminDeleteCourse(courseId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        await prisma.course.update({
            where: { id: courseId },
            data: { deletedAt: new Date(), published: false }, // Unpublish on delete
        });
        revalidatePath('/admin/courses');
    } catch (error) {
        throw new Error('Failed to delete course');
    }
}

export async function getAllEnrollments() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        const enrollments = await prisma.enrollment.findMany({
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } },
            },
            orderBy: { enrolledAt: 'desc' },
        });
        return enrollments;
    } catch (error) {
        return [];
    }
}

export async function getCourseAnalytics() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        const courses = await prisma.course.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                title: true,
                _count: { select: { contents: true, enrollments: true } },
                enrollments: {
                    select: {
                        completedAt: true,
                    }
                }
            }
        });

        return courses.map(course => {
            const total = course._count.enrollments;
            const completed = course.enrollments.filter(e => e.completedAt).length;
            const completionRate = total > 0 ? (completed / total) * 100 : 0;
            const dropOff = total - completed;

            return {
                id: course.id,
                title: course.title,
                totalEnrollments: total,
                completed,
                dropOff,
                completionRate: Math.round(completionRate)
            };
        });
    } catch (error) {
        return [];
    }
}

export async function getAllInvitations() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        const invitations = await prisma.invitation.findMany({
            include: {
                inviter: { select: { name: true, email: true } },
                course: { select: { title: true } },
            },
            orderBy: { expiresAt: 'desc' },
        });
        return invitations;
    } catch (error) {
        return [];
    }
}

export async function revokeInvitation(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

    try {
        await prisma.invitation.delete({
            where: { id },
        });
        revalidatePath('/admin/invitations');
    } catch (error) {
        throw new Error('Failed to revoke invitation');
    }
}




