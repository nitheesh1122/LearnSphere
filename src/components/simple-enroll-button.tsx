import { createSimpleEnrollment } from '@/lib/actions/simple-enrollment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SimpleEnrollButton() {
    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle>Quick Enrollment Test</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Click this button to create a test enrollment in the first available course.
                </p>
                <form action={async () => {
                    'use server';
                    try {
                        // Get first available course
                        const prisma = await import('@/lib/prisma').then(m => m.default);
                        const firstCourse = await prisma.course.findFirst({
                            where: { published: true },
                            select: { id: true, title: true },
                        });
                        
                        if (firstCourse) {
                            console.log('🎯 Quick Enroll: Found course:', firstCourse.title);
                            const result = await createSimpleEnrollment(firstCourse.id);
                            console.log('🎯 Quick Enroll: Result:', result);
                            
                            if (result.success) {
                                console.log('✅ Quick Enroll: Success! Redirecting...');
                                // Redirect to minimal dashboard to see the result
                                await import('next/navigation').then(m => m.redirect('/minimal-dashboard'));
                            } else {
                                console.log('❌ Quick Enroll: Failed:', result.error);
                            }
                        } else {
                            console.log('❌ Quick Enroll: No courses found');
                        }
                    } catch (error) {
                        console.error('❌ Quick Enroll: Error:', error);
                    }
                }}>
                    <Button type="submit" className="w-full">
                        Create Test Enrollment
                    </Button>
                </form>
                <div className="mt-4 text-xs text-muted-foreground">
                    Check browser console (F12) for detailed logs
                </div>
            </CardContent>
        </Card>
    );
}
