import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import EnrolledCourses from '@/components/learner/enrolled-courses';
import LearnerProfile from '@/components/learner/learner-profile';

export default async function LearnerDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        return redirect('/login');
    }

    // Fetch enrolled courses with progress
    const enrollments = await prisma.enrollment.findMany({
        where: { userId: session.user.id },
        include: {
            course: {
                include: {
                    instructor: {
                        select: {
                            name: true,
                        },
                    },
                    contents: {
                        where: { hidden: false },
                        select: {
                            id: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            enrolledAt: 'desc',
        },
    });

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
            const totalLessons = enrollment.course.contents.length;
            const completedLessons = await prisma.contentProgress.count({
                where: {
                    userId: session.user.id,
                    contentId: { in: enrollment.course.contents.map(c => c.id) },
                    isCompleted: true,
                },
            });

            const progressPercentage = totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            return {
                ...enrollment,
                totalLessons,
                completedLessons,
                progressPercentage,
            };
        })
    );

    // Calculate learner stats
    const completedCourses = enrollmentsWithProgress.filter(
        e => e.completedAt !== null
    ).length;

    // Calculate total points (from quiz attempts)
    const totalPoints = await prisma.quizAttempt.aggregate({
        where: {
            userId: session.user.id,
            completedAt: { not: null },
        },
        _sum: {
            score: true,
        },
    });

    const learnerStats = {
        totalEnrollments: enrollments.length,
        completedCourses,
        totalPoints: totalPoints._sum.score || 0,
        currentBadge: getBadgeForCourses(completedCourses),
        nextBadge: getNextBadge(completedCourses),
        coursesToNextBadge: getCoursesToNextBadge(completedCourses),
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Learning Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Track your progress and continue your learning journey
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Enrolled Courses */}
                <div className="lg:col-span-2">
                    <EnrolledCourses enrollments={enrollmentsWithProgress} />
                </div>

                {/* Sidebar - Profile */}
                <div className="lg:col-span-1">
                    <LearnerProfile
                        user={session.user}
                        stats={learnerStats}
                    />
                </div>
            </div>
        </div>
    );
}

// Badge system logic
function getBadgeForCourses(count: number): string {
    if (count >= 25) return 'Master';
    if (count >= 10) return 'Expert';
    if (count >= 5) return 'Advanced';
    if (count >= 1) return 'Beginner';
    return 'Newcomer';
}

function getNextBadge(count: number): string | null {
    if (count >= 25) return null;
    if (count >= 10) return 'Master';
    if (count >= 5) return 'Expert';
    if (count >= 1) return 'Advanced';
    return 'Beginner';
}

function getCoursesToNextBadge(count: number): number {
    if (count >= 25) return 0;
    if (count >= 10) return 25 - count;
    if (count >= 5) return 10 - count;
    if (count >= 1) return 5 - count;
    return 1 - count;
}
