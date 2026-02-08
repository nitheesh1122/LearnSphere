import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import EnrolledCourses from '@/components/learner/enrolled-courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default async function MyCoursesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return redirect('/login');
    }

    try {
        console.log('🔍 My Courses: Fetching enrollments for user:', session.user.id);

        // Simple query to get all enrollments
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

        console.log('📊 My Courses: Found total enrollments:', allEnrollments.length);

        // Filter for published courses
        const enrollments = allEnrollments.filter(enrollment => 
            enrollment.course && 
            enrollment.course.deletedAt === null && 
            enrollment.course.published === true
        );

        console.log('📊 My Courses: Found published enrollments:', enrollments.length);

        // Calculate progress for each enrollment
        const enrollmentsWithProgress = await Promise.all(
            enrollments.map(async (enrollment) => {
                try {
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
                } catch (error) {
                    console.error('❌ Error calculating progress:', error);
                    return {
                        ...enrollment,
                        totalLessons: 0,
                        completedLessons: 0,
                        progressPercentage: 0,
                    };
                }
            })
        );

        return (
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/learner/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground mt-2">
                        Continue your learning journey with your enrolled courses
                    </p>
                </div>

                {/* Debug Info */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Debug Information</h3>
                    <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Total Enrollments:</strong> {allEnrollments.length}</p>
                        <p><strong>Published Courses:</strong> {enrollments.length}</p>
                        <p><strong>User ID:</strong> {session.user.id}</p>
                        <p><strong>User Email:</strong> {session.user.email}</p>
                    </div>
                </div>

                {/* Enrolled Courses */}
                <EnrolledCourses enrollments={enrollmentsWithProgress} />

                {/* If no enrollments, show helpful info */}
                {enrollments.length === 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                No Courses Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {allEnrollments.length === 0 ? (
                                <div>
                                    <p className="text-muted-foreground mb-4">
                                        You haven't enrolled in any courses yet.
                                    </p>
                                    <Link href="/learner/catalog">
                                        <Button>Browse Catalog</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-muted-foreground mb-4">
                                        You have {allEnrollments.length} enrollment(s), but the courses are not published yet.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Contact your instructor to publish the courses, or check back later.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    } catch (error) {
        console.error('❌ My Courses Error:', error);
        return (
            <div className="container mx-auto py-8 px-4">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h3 className="text-lg font-semibold mb-2">Error Loading Courses</h3>
                        <p className="text-muted-foreground mb-4">
                            There was an error loading your courses. Please try again.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
}
