import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Award, TrendingUp } from 'lucide-react';
import { StreakMap } from '@/components/learner/streak-map';
import { getUserStreakStats } from '@/lib/actions/activity';

export default async function LearnerDashboardPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const streakStats = await getUserStreakStats(session.user.id);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name}</h1>
                <p className="text-muted-foreground">Track your progress and continue learning.</p>
            </div>

            <StreakMap
                activityMap={streakStats.dailyActivityMap}
                stats={{
                    currentStreak: streakStats.currentStreak,
                    longestStreak: streakStats.longestStreak,
                    activeDaysLast30: streakStats.activeDaysLast30
                }}
            />

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6 border-blue-100 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-1">0 Courses</h3>
                    <p className="text-sm text-muted-foreground mb-4">You're not enrolled yet</p>
                    <Button asChild size="sm" className="w-full">
                        <Link href="/learner/catalog">Browse Courses</Link>
                    </Button>
                </Card>

                <Card className="p-6 border-violet-100 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
                        <TrendingUp className="h-6 w-6 text-violet-600" />
                    </div>
                    <h3 className="font-semibold mb-1">0% Progress</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start learning to track progress</p>
                </Card>

                <Card className="p-6 border-emerald-100 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                        <Award className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold mb-1">0 Certificates</h3>
                    <p className="text-sm text-muted-foreground mb-4">Complete courses to earn</p>
                </Card>
            </div>

            <Card className="p-12 text-center border-dashed border-2">
                <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Start Your Learning Journey</h3>
                    <p className="text-muted-foreground">
                        Explore our catalog of courses and enroll to begin tracking your progress.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/learner/catalog">Explore Catalog</Link>
                    </Button>
                </div>
            </Card>      </div>
    );
}
