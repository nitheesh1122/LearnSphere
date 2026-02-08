import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LessonSidebar from '@/components/learner/lesson-sidebar';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkCourseCompletion } from '@/lib/actions/certificate';
import CourseCompletion from '@/components/learner/course-completion';

interface CourseLearnPageProps {
    params: Promise<{
        courseId: string;
    }>;
}

export default async function CourseLearnPage({ params }: { params: Promise<{ courseId: string }> }) {
    const session = await auth();
    const { courseId } = await params;

    if (!session?.user?.id) {
        return redirect('/login');
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: session.user.id,
                courseId,
            },
        },
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
        },
    });

    if (!enrollment) {
        return redirect(`/learner/course/${courseId}`);
    }

    // Fetch lessons with progress
    const lessons = await prisma.courseContent.findMany({
        where: {
            courseId,
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
            contentId: { in: lessons.map(l => l.id) },
        },
    });

    const progressMap = new Map(progress.map(p => [p.contentId, p]));

    // Determine lesson lock states
    const lessonsWithState = await Promise.all(
        lessons.map(async (lesson, index) => {
            const lessonProgress = progressMap.get(lesson.id);
            const isCompleted = lessonProgress?.isCompleted || false;

            // First lesson is always unlocked
            if (index === 0) {
                return { ...lesson, isLocked: false, isCompleted };
            }

            // Check previous lesson
            const previousLesson = lessons[index - 1];
            const previousProgress = progressMap.get(previousLesson.id);
            const previousCompleted = previousProgress?.isCompleted || false;

            // Lesson is locked if previous is not completed
            // OR if previous was a required quiz that wasn't passed
            let isLocked = !previousCompleted;

            if (previousLesson.type === 'QUIZ' && previousLesson.quiz) {
                // Check if quiz was passed
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

            return { ...lesson, isLocked, isCompleted };
        })
    );

    const completedCount = lessonsWithState.filter(l => l.isCompleted).length;
    const progressPercentage = lessons.length > 0
        ? Math.round((completedCount / lessons.length) * 100)
        : 0;

    // Find first incomplete lesson
    const firstIncompleteLesson = lessonsWithState.find(l => !l.isCompleted && !l.isLocked);

    // Check course completion
    const completionStatus = await checkCourseCompletion(courseId);
    const isCompleted = completionStatus.completed || false;

    // Fetch certificate if exists
    let certificate = null;
    if (isCompleted) {
        certificate = await prisma.certificate.findFirst({
            where: {
                userId: session.user.id,
                courseId,
            },
        });
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto py-6 px-4">
                    <h1 className="text-2xl font-bold mb-2">{enrollment.course.title}</h1>
                    <p className="text-sm text-muted-foreground mb-4">
                        By {enrollment.course.instructor.name || 'Unknown Instructor'}
                    </p>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                                {completedCount} / {lessons.length} lessons completed
                            </span>
                            <span className="text-sm font-medium">{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <LessonSidebar lessons={lessonsWithState} courseId={courseId} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {lessons.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No Lessons Available</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        This course doesn't have any lessons yet. The instructor is still working on the content. Check back soon!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : isCompleted ? (
                            <CourseCompletion
                                courseId={courseId}
                                courseName={enrollment.course.title}
                                completionStatus={completionStatus}
                                existingCertificate={certificate}
                            />
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Overview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        {enrollment.course.description || 'Start learning by selecting a lesson from the sidebar.'}
                                    </p>

                                    {firstIncompleteLesson && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                            <p className="font-semibold text-blue-900 mb-2">Continue where you left off:</p>
                                            <p className="text-blue-800">{firstIncompleteLesson.title}</p>
                                            <a
                                                href={`/learner/learn/lesson/${firstIncompleteLesson.id}`}
                                                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Continue Learning
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
