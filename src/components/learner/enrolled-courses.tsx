'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Enrollment {
    id: string;
    enrolledAt: Date;
    completedAt: Date | null;
    course: {
        id: string;
        title: string;
        description: string | null;
        instructor: {
            name: string | null;
        };
    };
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
}

interface EnrolledCoursesProps {
    enrollments: Enrollment[];
}

export default function EnrolledCourses({ enrollments }: EnrolledCoursesProps) {
    if (enrollments.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Start your learning journey by enrolling in a course
                    </p>
                    <Link href="/learner/catalog">
                        <Button>Browse Catalog</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const getStatusBadge = (enrollment: Enrollment) => {
        if (enrollment.completedAt) {
            return (
                <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                </Badge>
            );
        }
        if (enrollment.progressPercentage > 0) {
            return (
                <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                </Badge>
            );
        }
        return (
            <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                Not Started
            </Badge>
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Courses</h2>

            {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <CardTitle className="mb-2">{enrollment.course.title}</CardTitle>
                                <CardDescription>
                                    By {enrollment.course.instructor.name || 'Unknown Instructor'}
                                </CardDescription>
                            </div>
                            {getStatusBadge(enrollment)}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">
                                    Progress: {enrollment.completedLessons} / {enrollment.totalLessons} lessons
                                </span>
                                <span className="text-sm font-medium">
                                    {enrollment.progressPercentage}%
                                </span>
                            </div>
                            <Progress value={enrollment.progressPercentage} />
                        </div>

                        <div className="flex gap-2">
                            <Link href={`/learner/learn/${enrollment.course.id}`} className="flex-1">
                                <Button className="w-full">
                                    {enrollment.progressPercentage === 0 ? 'Start Course' : 'Continue Learning'}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
