import { getAdminStats } from '@/lib/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';

export default async function AdminDashboardPage() {
    const stats = await getAdminStats();

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your platform</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.totalInstructors} Instructors · {stats.totalLearners} Learners
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Courses
                        </CardTitle>
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.publishedCourses} Published · {stats.draftCourses} Drafts
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Enrollments
                        </CardTitle>
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalEnrollments}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all courses
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-violet-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Platform Health
                        </CardTitle>
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-violet-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">95%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            System performance
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
