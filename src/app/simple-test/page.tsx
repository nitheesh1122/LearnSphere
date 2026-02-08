import { getSimpleEnrollments, createSimpleEnrollment } from '@/lib/actions/simple-enrollment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SimpleEnrollButton from '@/components/simple-enroll-button';

export default async function SimpleTestPage() {
    const enrollmentTest = await getSimpleEnrollments();

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Simple Enrollment Test</h1>
            
            {/* Connection Test */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Database Connection Test</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`p-4 rounded ${enrollmentTest.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <p className="font-semibold">
                            {enrollmentTest.success ? '✅ Connected' : '❌ Failed'}
                        </p>
                        {enrollmentTest.error && <p className="text-sm mt-1">Error: {enrollmentTest.error}</p>}
                        {enrollmentTest.success && (
                            <p className="text-sm mt-1">Found {enrollmentTest.enrollments?.length || 0} enrollments</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Enrollments Display */}
            {enrollmentTest.success && enrollmentTest.enrollments && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Your Enrollments ({enrollmentTest.enrollments.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {enrollmentTest.enrollments.length === 0 ? (
                            <p className="text-muted-foreground">No enrollments found</p>
                        ) : (
                            <div className="space-y-2">
                                {enrollmentTest.enrollments.map((enrollment) => (
                                    <div key={enrollment.id} className="p-3 border rounded">
                                        <p className="font-semibold">Course ID: {enrollment.courseId}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Enrolled: {enrollment.enrolledAt.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Completed: {enrollment.completedAt ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Test Enrollment Creation */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Test Enrollment Creation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        This will create a test enrollment for the first available course.
                    </p>
                    <form action={async () => {
                        'use server';
                        // Get first available course
                        const prisma = await import('@/lib/prisma').then(m => m.default);
                        const firstCourse = await prisma.course.findFirst({
                            where: { published: true },
                            select: { id: true, title: true },
                        });
                        
                        if (firstCourse) {
                            const result = await createSimpleEnrollment(firstCourse.id);
                            console.log('Test enrollment result:', result);
                        } else {
                            console.log('No courses available for testing');
                        }
                    }}>
                        <Button type="submit">Create Test Enrollment (Server Action)</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Simple Enrollment Button */}
            <SimpleEnrollButton />

            {/* Instructions */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Debug Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                        <li>Check the database connection status above</li>
                        <li>Look at your current enrollments</li>
                        <li>Try creating a test enrollment</li>
                        <li>Check browser console for detailed logs</li>
                        <li>Refresh your learner dashboard to see changes</li>
                    </ol>
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                        <p className="text-xs font-mono">
                            Open browser console (F12) to see detailed logs with 🔍, 📊, 🎓, ✅, ❌ emojis
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
