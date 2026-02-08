import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function MinimalDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        return redirect('/login');
    }

    console.log('🔍 Minimal Dashboard: User ID:', session.user.id);

    try {
        // Ultra simple enrollment query
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: session.user.id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        console.log('📊 Minimal Dashboard: Raw enrollments count:', enrollments.length);
        console.log('📋 Minimal Dashboard: Raw data:', JSON.stringify(enrollments, null, 2));

        return (
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Minimal Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Simplified view of your enrolled courses
                    </p>
                </div>

                {/* Debug Info */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Debug:</strong> User ID: {session.user.id} | Enrollments: {enrollments.length}
                    </p>
                </div>

                {/* Enrollments */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Your Enrollments ({enrollments.length})</h2>
                    
                    {enrollments.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-muted-foreground">No enrollments found</p>
                                <Link href="/simple-test" className="mt-4 inline-block">
                                    <Button>Test Enrollment System</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        enrollments.map((enrollment, index) => (
                            <Card key={enrollment.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            #{index + 1}
                                        </span>
                                        {enrollment.course.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Course ID: {enrollment.course.id}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Enrollment ID: {enrollment.id}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Enrolled: {enrollment.enrolledAt.toLocaleDateString()}
                                        </p>
                                        <Link href={`/learner/learn/${enrollment.course.id}`}>
                                            <Button className="mt-2">Go to Course</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                        <Link href="/simple-test">
                            <Button variant="outline" className="w-full">Test Enrollment System</Button>
                        </Link>
                        <Link href="/learner/catalog">
                            <Button variant="outline" className="w-full">Browse Courses</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('❌ Minimal Dashboard Error:', error);
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
                    <p className="text-muted-foreground mb-4">Error loading dashboard</p>
                    <pre className="text-left bg-gray-100 p-4 rounded text-sm">
                        {error instanceof Error ? error.message : 'Unknown error'}
                    </pre>
                    <Link href="/simple-test" className="mt-4 inline-block">
                        <Button>Test System</Button>
                    </Link>
                </div>
            </div>
        );
    }
}
