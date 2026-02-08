import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import CourseEditForm from '@/components/instructor/course-edit-form';

interface EditCoursePageProps {
    params: {
        courseId: string;
    };
}

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    const { courseId } = await params;

    if (!session?.user?.id) {
        return redirect('/login');
    }

    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
            instructorId: session.user.id,
        },
    });

    if (!course) {
        return redirect('/instructor/courses');
    }

    const lessons = await prisma.courseContent.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
    });

    // Fetch quizzes for this course
    const quizzes = await prisma.quiz.findMany({
        where: {
            content: {
                courseId: courseId,
            },
        },
        include: {
            _count: {
                select: { questions: true },
            },
        },
    });

    // Cast accessType because it's stored as string but typed strictly in form props
    const formData = {
        ...course,
        accessType: course.accessType as string,
        level: course.level as string,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/instructor/courses" className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
                    <p className="text-sm text-muted-foreground">
                        {course.title}
                    </p>
                </div>
            </div>

            <CourseEditForm course={formData} lessons={lessons} quizzes={quizzes} />
        </div>
    );
}
