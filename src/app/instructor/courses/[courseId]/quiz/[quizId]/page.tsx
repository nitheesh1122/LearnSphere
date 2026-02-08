import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import QuizBuilder from '@/components/instructor/quiz-builder';

interface QuizBuilderPageProps {
    params: Promise<{
        courseId: string;
        quizId: string;
    }>;
}

export default async function QuizBuilderPage({ params }: QuizBuilderPageProps) {
    const session = await auth();
    const { courseId, quizId } = await params;

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
    let quiz = await prisma.quiz.findUnique({
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

    console.log('Quiz Builder Debug:', { quizId, quiz, courseId });

    if (!quiz || quiz.content.courseId !== courseId) {
        console.log('Quiz not found or invalid course:', { quizFound: !!quiz, courseId: quiz?.content?.courseId, expectedCourseId: courseId });
        
        // Try to create quiz record if it doesn't exist
        if (!quiz) {
            console.log('Attempting to create missing quiz record...');
            try {
                const newQuiz = await prisma.quiz.create({
                    data: {
                        contentId: quizId, // Use quizId as contentId (lessonId)
                        passingScore: 70,
                    },
                });
                console.log('Created missing quiz record:', newQuiz.id);
                
                // Fetch the newly created quiz
                const createdQuiz = await prisma.quiz.findUnique({
                    where: { id: newQuiz.id },
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
                
                if (createdQuiz && createdQuiz.content.courseId === courseId) {
                    console.log('Using newly created quiz:', createdQuiz.id);
                    quiz = createdQuiz; // Use let instead of const for reassignment
                } else {
                    console.log('Created quiz but validation failed');
                    return redirect(`/instructor/courses/${courseId}/edit`);
                }
            } catch (error) {
                console.error('Failed to create quiz record:', error);
                return redirect(`/instructor/courses/${courseId}/edit`);
            }
        } else {
            return redirect(`/instructor/courses/${courseId}/edit`);
        }
    }

    // Transform quiz data to match QuizBuilder interface
    const transformedQuiz: any = {
        ...quiz,
        questions: quiz.questions.map(q => ({
            ...q,
            required: true, // Add missing required field
            type: q.type as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY', // Cast to proper type
        })),
    };

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

            <QuizBuilder quiz={transformedQuiz} courseId={courseId} />
        </div>
    );
}
