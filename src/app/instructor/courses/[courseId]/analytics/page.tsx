import { getCourseAnalytics } from '@/lib/actions/analytics';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import AnalyticsDashboard from '@/components/instructor/analytics-dashboard';
import prisma from '@/lib/prisma';

interface AnalyticsPageProps {
    params: Promise<{
        courseId: string;
    }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
    const session = await auth();
    const { courseId } = await params;

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

    const analytics = await getCourseAnalytics(courseId);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/instructor/courses/${courseId}/edit`} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Course Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        {course.title}
                    </p>
                </div>
            </div>

            <AnalyticsDashboard analytics={analytics} courseId={courseId} />
        </div>
    );
}
