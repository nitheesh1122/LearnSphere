import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function LearnerDashboardPage() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name}</h1>
                <p className="text-muted-foreground">Track your progress and continue learning.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder for Enrollments */}
                <div className="col-span-full rounded-lg border border-dashed p-12 text-center">
                    <h3 className="text-lg font-semibold">No active enrollments</h3>
                    <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                    <Button asChild>
                        <Link href="/learner/catalog">Browse Catalog</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
