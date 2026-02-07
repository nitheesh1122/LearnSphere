'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Lesson {
    id: string;
    title: string;
    type: string;
    order: number;
    isLocked: boolean;
    isCompleted: boolean;
}

interface LessonSidebarProps {
    lessons: Lesson[];
    courseId: string;
    currentLessonId?: string;
}

export default function LessonSidebar({ lessons, courseId, currentLessonId }: LessonSidebarProps) {
    const getIcon = (lesson: Lesson) => {
        if (lesson.isLocked) {
            return <Lock className="h-4 w-4 text-muted-foreground" />;
        }
        if (lesson.isCompleted) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        }
        if (lesson.type === 'VIDEO') {
            return <PlayCircle className="h-4 w-4 text-blue-600" />;
        }
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle className="text-base">Course Content</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {lessons.map((lesson, index) => {
                        const isActive = currentLessonId === lesson.id;

                        if (lesson.isLocked) {
                            return (
                                <div
                                    key={lesson.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-md opacity-50 cursor-not-allowed",
                                        isActive && "bg-blue-50"
                                    )}
                                >
                                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                                    {getIcon(lesson)}
                                    <div className="flex-1">
                                        <p className="text-sm">{lesson.title}</p>
                                        <Badge variant="outline" className="text-xs mt-1">{lesson.type}</Badge>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={lesson.id}
                                href={`/learner/learn/lesson/${lesson.id}`}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors",
                                    isActive && "bg-blue-50 hover:bg-blue-100"
                                )}
                            >
                                <span className="text-xs text-muted-foreground">{index + 1}</span>
                                {getIcon(lesson)}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{lesson.title}</p>
                                    <Badge variant="outline" className="text-xs mt-1">{lesson.type}</Badge>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
