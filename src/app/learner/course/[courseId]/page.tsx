import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { checkEnrollmentStatus } from '@/lib/actions/enrollment';
import CourseDetailView from '@/components/learner/course-detail-view';

interface CourseDetailPageProps {
    params: {
        courseId: string;
    };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    const { courseId } = await params;

    // Fetch course with details
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            instructor: {
                select: {
                    name: true,
                    email: true,
                },
            },
            contents: {
                where: { hidden: false },
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    title: true,
                    type: true,
                },
            },
            _count: {
                select: {
                    enrollments: true,
                },
            },
        },
    });

    if (!course || !course.published || course.deletedAt) {
        return redirect('/learner/catalog');
    }

    // Check visibility
    if (course.visibility === 'SIGNED_IN' && !session?.user?.id) {
        return redirect('/login');
    }

    // Check enrollment status
    const enrollmentStatus = await checkEnrollmentStatus(courseId);

    // If already enrolled, redirect to course learning page
    if (enrollmentStatus.enrolled) {
        return redirect(`/learner/learn/${courseId}`);
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <CourseDetailView
                course={course}
                isAuthenticated={!!session?.user?.id}
            />
        </div>
    );
}
