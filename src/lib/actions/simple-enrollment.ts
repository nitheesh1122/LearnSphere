import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function getSimpleEnrollments() {
    try {
        const session = await auth();
        console.log('🔍 Simple Test: Session:', session?.user?.id);

        if (!session?.user?.id) {
            return { success: false, error: 'No user session' };
        }

        // Very simple query - just get enrollments
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: session.user.id },
        });

        console.log('📊 Simple Test: Raw enrollments:', enrollments.length);

        return { success: true, enrollments };
    } catch (error) {
        console.error('❌ Simple Test: Error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function createSimpleEnrollment(courseId: string) {
    try {
        const session = await auth();
        console.log('🎓 Simple Test: Creating enrollment for:', session?.user?.id);

        if (!session?.user?.id) {
            return { success: false, error: 'No user session' };
        }

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return { success: false, error: 'Course not found' };
        }

        // Create enrollment without any complex logic
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: session.user.id,
                courseId: courseId,
            },
        });

        console.log('✅ Simple Test: Enrollment created:', enrollment.id);
        return { success: true, enrollment };
    } catch (error) {
        console.error('❌ Simple Test: Error creating enrollment:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
