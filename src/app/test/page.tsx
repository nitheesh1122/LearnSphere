import { testDatabaseConnection, createTestEnrollment } from '@/lib/actions/test-db';
import { Button } from '@/components/ui/button';

export default async function TestPage() {
    const dbTest = await testDatabaseConnection();

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>

            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                    <h2 className="font-semibold mb-2">Connection Status</h2>
                    <p className={`text-sm ${dbTest.success ? 'text-green-600' : 'text-red-600'}`}>
                        {dbTest.success ? '✅ Connected' : '❌ Failed'}
                    </p>
                    {dbTest.error && (
                        <p className="text-sm text-red-600 mt-1">Error: {dbTest.error}</p>
                    )}
                </div>

                {dbTest.success && (
                    <>
                        <div className="p-4 border rounded-lg">
                            <h2 className="font-semibold mb-2">Database Stats</h2>
                            <ul className="text-sm space-y-1">
                                <li>Users: {dbTest.userCount}</li>
                                <li>Courses: {dbTest.courseCount}</li>
                                <li>Your Enrollments: {dbTest.enrollmentCount}</li>
                            </ul>
                        </div>

                        {dbTest.enrollments && dbTest.enrollments.length > 0 && (
                            <div className="p-4 border rounded-lg">
                                <h2 className="font-semibold mb-2">Your Enrollments</h2>
                                <ul className="text-sm space-y-1">
                                    {dbTest.enrollments.map((enrollment) => (
                                        <li key={enrollment.id}>
                                            {enrollment.course.title} (Enrolled: {enrollment.enrolledAt.toLocaleDateString()})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="p-4 border rounded-lg">
                            <h2 className="font-semibold mb-2">Test Enrollment Creation</h2>
                            <p className="text-sm text-muted-foreground mb-2">
                                This will create a test enrollment for the first available course.
                            </p>
                            <form action={async () => {
                                'use server';
                                // Get first course ID for testing
                                const { testDatabaseConnection: getConnection } = await import('@/lib/actions/test-db');
                                const connection = await getConnection();

                                if (connection.success && connection.courseCount && connection.courseCount > 0) {
                                    // We need to get a course ID - for now, let's use a hardcoded one or fetch
                                    const prisma = await import('@/lib/prisma').then(m => m.default);
                                    const firstCourse = await prisma.course.findFirst({
                                        where: { published: true },
                                        select: { id: true },
                                    });

                                    if (firstCourse) {
                                        const result = await createTestEnrollment(firstCourse.id);
                                        console.log('Test enrollment result:', result);
                                    }
                                }
                            }}>
                                <Button type="submit">Create Test Enrollment</Button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <h2 className="font-semibold mb-2">Debug Instructions</h2>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Check browser console for detailed logs</li>
                    <li>Verify database connection status above</li>
                    <li>Check your current enrollment count</li>
                    <li>Try creating a test enrollment</li>
                    <li>Refresh your learner dashboard to see changes</li>
                </ol>
            </div>
        </div>
    );
}
