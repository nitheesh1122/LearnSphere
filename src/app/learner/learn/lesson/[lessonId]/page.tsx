import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ContentViewer from '@/components/learner/content-viewer';
import LessonSidebar from '@/components/learner/lesson-sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LessonViewPageProps {
    params: Promise<{
        lessonId: string;
    }>;
}

export default async function LessonViewPage({ params }: LessonViewPageProps) {
    const session = await auth();
    const { lessonId } = await params;

    // Validate lessonId parameter
    if (!lessonId || typeof lessonId !== 'string') {
        return redirect('/learner/dashboard');
    }

    // Fetch lesson with course
    const lesson = await prisma.courseContent.findUnique({
        where: { id: lessonId },
        include: {
            course: {
                include: {
                    instructor: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            quiz: {
                include: {
                    questions: {
                        include: {
                            answers: true,
                        },
                        orderBy: { order: 'asc' },
                    },
                },
            },
        },
    });

    if (!lesson) {
        return redirect('/learner/dashboard');
    }

    // Allow access to preview lessons without enrollment
    if (lesson.isPreview) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto py-8 px-4">
                    <div className="mb-6">
                        <Link href={`/courses/${lesson.courseId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
                            ← Back to Course
                        </Link>
                    </div>
                    <div className="text-center mb-6">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4">
                            Preview Lesson
                        </Badge>
                        <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
                        <p className="text-muted-foreground">
                            This is a preview lesson. Enroll in the course to access all content.
                        </p>
                    </div>
                    <ContentViewer
                        lesson={lesson}
                        isCompleted={false}
                        allLessons={[lesson]}
                    />
                    <div className="mt-8 text-center">
                        <Link href={`/courses/${lesson.courseId}`}>
                            <Button size="lg">
                                Enroll in Course to Continue Learning
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // For non-preview lessons, require authentication and enrollment
    if (!session?.user?.id) {
        return redirect('/login');
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId: lesson.courseId,
            },
        },
    });

    if (!enrollment) {
        return redirect(`/learner/course/${lesson.courseId}`);
    }

    // Fetch all lessons for sidebar
    const allLessons = await prisma.courseContent.findMany({
        where: {
            courseId: lesson.courseId,
            hidden: false,
        },
        orderBy: { order: 'asc' },
        include: {
            quiz: {
                select: {
                    id: true,
                    passingScore: true,
                },
            },
        },
    });

    // Fetch user progress
    const progress = await prisma.contentProgress.findMany({
        where: {
            userId: session.user.id,
            contentId: { in: allLessons.map(l => l.id) },
        },
    });

    const progressMap = new Map(progress.map(p => [p.contentId, p]));

    // Determine lesson lock states (same logic as course page)
    const lessonsWithState = await Promise.all(
        allLessons.map(async (l, index) => {
            const lessonProgress = progressMap.get(l.id);
            const isCompleted = lessonProgress?.isCompleted || false;

            if (index === 0) {
                return { ...l, isLocked: false, isCompleted };
            }

            const previousLesson = allLessons[index - 1];
            const previousProgress = progressMap.get(previousLesson.id);
            const previousCompleted = previousProgress?.isCompleted || false;

            let isLocked = !previousCompleted;

            if (previousLesson.type === 'QUIZ' && previousLesson.quiz) {
                const quizAttempts = await prisma.quizAttempt.findMany({
                    where: {
                        userId: session.user.id,
                        quizId: previousLesson.quiz.id,
                        score: { gte: previousLesson.quiz.passingScore },
                    },
                });
                if (quizAttempts.length === 0) {
                    isLocked = true;
                }
            }

            return { ...l, isLocked, isCompleted };
        })
    );

    // Check if current lesson is locked
    const currentLessonState = lessonsWithState.find(l => l.id === lessonId);
    if (currentLessonState?.isLocked) {
        return redirect(`/learner/learn/${lesson.courseId}`);
    }

    // Get current lesson progress
    const currentProgress = progressMap.get(lessonId);

    // If quiz, redirect to quiz player
    if (lesson.type === 'QUIZ' && lesson.quiz) {
        return redirect(`/learner/quiz/${lesson.quiz.id}`);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <LessonSidebar
                            lessons={lessonsWithState}
                            courseId={lesson.courseId}
                            currentLessonId={lessonId}
                        />
                    </div>

                    {/* Content Viewer */}
                    <div className="lg:col-span-2">
                        <ContentViewer
                            lesson={lesson}
                            isCompleted={currentProgress?.isCompleted || false}
                            allLessons={lessonsWithState}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
