import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import QuizPlayer from '@/components/learner/quiz-player';
import { getQuizAttempts } from '@/lib/actions/quiz';

interface QuizPageProps {
    params: {
        quizId: string;
    };
}

export default async function QuizPage({ params }: QuizPageProps) {
    const session = await auth();
    const { quizId } = params;

    if (!session?.user?.id) {
        return redirect('/login');
    }

    // Fetch quiz with questions
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            content: {
                include: {
                    course: true,
                },
            },
            questions: {
                include: {
                    answers: true,
                },
                orderBy: { order: 'asc' },
            },
        },
    });

    if (!quiz) {
        return redirect('/learner/dashboard');
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId: quiz.content.courseId,
            },
        },
    });

    if (!enrollment) {
        return redirect(`/learner/course/${quiz.content.courseId}`);
    }

    // Fetch previous attempts
    const attemptsResult = await getQuizAttempts(quizId);
    const previousAttempts = attemptsResult.attempts || [];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <QuizPlayer
                    quiz={quiz}
                    previousAttempts={previousAttempts}
                    courseId={quiz.content.courseId}
                />
            </div>
        </div>
    );
}
