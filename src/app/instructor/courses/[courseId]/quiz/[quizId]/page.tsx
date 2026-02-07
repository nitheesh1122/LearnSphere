import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import QuizBuilder from '@/components/instructor/quiz-builder';

interface QuizBuilderPageProps {
    params: {
        courseId: string;
        quizId: string;
    };
}

export default async function QuizBuilderPage({ params }: QuizBuilderPageProps) {
    const session = await auth();
    const { courseId, quizId } = params;

    if (!session?.user?.id) {
        return redirect('/login');
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
        where: {
            id: courseId,
            instructorId: session.user.id,
        },
    });

    if (!course) {
        return redirect('/instructor/courses');
    }

    // Fetch quiz with questions
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            questions: {
                include: {
                    answers: true,
                },
                orderBy: { order: 'asc' },
            },
            content: true,
        },
    });

    if (!quiz || quiz.content.courseId !== courseId) {
        return redirect(`/instructor/courses/${courseId}/edit`);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/instructor/courses/${courseId}/edit`} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Quiz Builder</h1>
                    <p className="text-sm text-muted-foreground">
                        {course.title} • {quiz.content.title}
                    </p>
                </div>
            </div>

            <QuizBuilder quiz={quiz} courseId={courseId} />
        </div>
    );
}
