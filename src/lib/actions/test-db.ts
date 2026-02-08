'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function testDatabaseConnection() {
    try {
        const session = await auth();
        console.log('Test DB - User session:', session?.user?.id);

        // Test 1: Check if we can read users
        const userCount = await prisma.user.count();
        console.log('Test DB - User count:', userCount);

        // Test 2: Check if we can read courses
        const courseCount = await prisma.course.count();
        console.log('Test DB - Course count:', courseCount);

        // Test 3: Check enrollments for current user
        if (session?.user?.id) {
            const userEnrollments = await prisma.enrollment.findMany({
                where: { userId: session.user.id },
                include: {
                    course: {
                        select: {
                            title: true,
                        },
                    },
                },
            });
            console.log('Test DB - User enrollments:', userEnrollments.length);
            console.log('Test DB - Enrollment details:', userEnrollments);

            return {
                success: true,
                userCount,
                courseCount,
                enrollmentCount: userEnrollments.length,
                enrollments: userEnrollments,
            };
        }

        return {
            success: true,
            userCount,
            courseCount,
            enrollmentCount: 0,
        };
    } catch (error) {
        console.error('Test DB - Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function createTestEnrollment(courseId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        console.log('Test Enrollment - Creating for user:', session.user.id, 'course:', courseId);

        // Check if already enrolled
        const existing = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId,
                },
            },
        });

        if (existing) {
            console.log('Test Enrollment - Already enrolled');
            return { success: false, error: 'Already enrolled' };
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: session.user.id,
                courseId,
            },
        });

        console.log('Test Enrollment - Created:', enrollment);
        return { success: true, enrollment };
    } catch (error) {
        console.error('Test Enrollment - Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
