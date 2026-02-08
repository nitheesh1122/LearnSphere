import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import EnrolledCourses from '@/components/learner/enrolled-courses';
import LearnerProfile from '@/components/learner/learner-profile';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default async function LearnerDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        return redirect('/login');
    }

    try {
        console.log('🔍 Dashboard: Fetching enrollments for user:', session.user.id);

        // First, try a simple query to see if enrollments exist
        const allEnrollments = await prisma.enrollment.findMany({
            where: { 
                userId: session.user.id
            },
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

        console.log('📊 Dashboard: Found total enrollments:', allEnrollments.length);
        
        // Filter for published courses only
        const enrollments = allEnrollments.filter(enrollment => 
            enrollment.course && 
            enrollment.course.deletedAt === null && 
            enrollment.course.published === true
        );

        console.log('📊 Dashboard: Found published enrollments:', enrollments.length);
        console.log('📋 Dashboard: Enrollment data:', JSON.stringify(enrollments, null, 2));

        // If no published enrollments, but user has enrollments, show all for debugging
        const displayEnrollments = enrollments.length > 0 ? enrollments : allEnrollments;

        // Calculate progress for each enrollment
        const enrollmentsWithProgress = await Promise.all(
            displayEnrollments.map(async (enrollment) => {
                try {
                    const totalLessons = enrollment.course.contents.length;
                    
                    // Get completed lessons count
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

                    console.log(`📈 Progress for ${enrollment.course.title}: ${completedLessons}/${totalLessons} (${progressPercentage}%)`);

                    return {
                        ...enrollment,
                        totalLessons,
                        completedLessons,
                        progressPercentage,
                    };
                } catch (error) {
                    console.error('❌ Error calculating progress for enrollment:', enrollment.id, error);
                    return {
                        ...enrollment,
                        totalLessons: 0,
                        completedLessons: 0,
                        progressPercentage: 0,
                    };
                }
            })
        );

        // Calculate learner stats
        const completedCourses = displayEnrollments.filter(
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
            totalEnrollments: displayEnrollments.length,
            completedCourses,
            totalPoints: totalPoints._sum.score || 0,
            currentBadge: getBadgeForCourses(completedCourses),
            nextBadge: getNextBadge(completedCourses),
            coursesToNextBadge: getCoursesToNextBadge(completedCourses),
        };

        console.log('🎯 Dashboard: Final stats:', learnerStats);

        return (
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">My Learning Dashboard</h1>
                            <p className="text-muted-foreground mt-2">
                                Track your progress and continue your learning journey
                            </p>
                        </div>
                        <Link href="/learner/my-courses">
                            <Button variant="outline">
                                <BookOpen className="mr-2 h-4 w-4" />
                                View All Courses
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Debug Info:</strong> Found {allEnrollments.length} total enrollments, {enrollments.length} published courses
                        </p>
                    </div>
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
    } catch (error) {
        console.error('❌ Dashboard Error:', error);
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
                    <p className="text-muted-foreground">There was an error loading your dashboard. Please try refreshing the page.</p>
                    <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
                        {error instanceof Error ? error.message : 'Unknown error'}
                    </pre>
                </div>
            </div>
        );
    }
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
