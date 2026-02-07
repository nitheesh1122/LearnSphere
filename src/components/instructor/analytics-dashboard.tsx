'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Users, Eye, Award, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AnalyticsDashboardProps {
    analytics: any;
    courseId: string;
}

export default function AnalyticsDashboard({ analytics, courseId }: AnalyticsDashboardProps) {
    const { overview, recentQuizAttempts, studentProgress } = analytics;

    const stats = [
        {
            title: 'Total Enrollments',
            value: overview.totalEnrollments,
            icon: Users,
            description: 'Students enrolled',
            color: 'text-blue-600',
        },
        {
            title: 'Course Views',
            value: overview.views,
            icon: Eye,
            description: 'Total page views',
            color: 'text-purple-600',
        },
        {
            title: 'Completion Rate',
            value: `${overview.completionRate}%`,
            icon: CheckCircle2,
            description: `${overview.completedEnrollments} completed`,
            color: 'text-green-600',
        },
        {
            title: 'Avg Quiz Score',
            value: `${overview.avgQuizScore}%`,
            icon: Award,
            description: 'Across all attempts',
            color: 'text-orange-600',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Student Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Progress</CardTitle>
                    <CardDescription>
                        Track how your students are advancing through the course
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {studentProgress.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No students enrolled yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Completed</TableHead>
                                    <TableHead>Enrolled</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentProgress.map((student: any) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{student.user.name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {student.user.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={student.progressPercentage} className="w-[100px]" />
                                                <span className="text-xs text-muted-foreground">
                                                    {student.progressPercentage}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {student.completedContent} / {student.totalContent}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(student.enrolledAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {student.completedAt ? (
                                                <Badge variant="default" className="bg-green-600">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Completed
                                                </Badge>
                                            ) : student.progressPercentage > 0 ? (
                                                <Badge variant="secondary">
                                                    <TrendingUp className="mr-1 h-3 w-3" />
                                                    In Progress
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    Not Started
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Recent Quiz Attempts */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Quiz Attempts</CardTitle>
                    <CardDescription>
                        Latest quiz submissions from your students
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {recentQuizAttempts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No quiz attempts yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Quiz</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentQuizAttempts.map((attempt: any) => {
                                    const passed = attempt.score >= attempt.quiz.passingScore;
                                    return (
                                        <TableRow key={attempt.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{attempt.user.name || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {attempt.user.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{attempt.quiz.content.title}</TableCell>
                                            <TableCell>
                                                <span className={`font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                                    {attempt.score}%
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {attempt.completedAt ? (
                                                    passed ? (
                                                        <Badge variant="default" className="bg-green-600">
                                                            Passed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            Failed
                                                        </Badge>
                                                    )
                                                ) : (
                                                    <Badge variant="secondary">
                                                        In Progress
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {attempt.completedAt
                                                    ? new Date(attempt.completedAt).toLocaleDateString()
                                                    : 'Ongoing'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
