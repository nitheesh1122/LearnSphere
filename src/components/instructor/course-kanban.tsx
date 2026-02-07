'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CourseKanbanProps {
    courses: any[];
}

export function CourseKanban({ courses }: CourseKanbanProps) {
    const draftCourses = courses.filter(c => !c.published);
    const publishedCourses = courses.filter(c => c.published);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Draft Column */}
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                    <h3 className="font-semibold text-muted-foreground">Drafts</h3>
                    <Badge variant="secondary">{draftCourses.length}</Badge>
                </div>
                <div className="space-y-4">
                    {draftCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                    {draftCourses.length === 0 && (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                            No draft courses
                        </div>
                    )}
                </div>
            </div>

            {/* Published Column */}
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-100">
                    <h3 className="font-semibold text-green-700">Published</h3>
                    <Badge className="bg-green-600">{publishedCourses.length}</Badge>
                </div>
                <div className="space-y-4">
                    {publishedCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                    {publishedCourses.length === 0 && (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                            No published courses
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CourseCard({ course }: { course: any }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base line-clamp-1">
                            <Link href={`/instructor/courses/${course.id}/edit`} className="hover:underline">
                                {course.title}
                            </Link>
                        </CardTitle>
                        <div className="flex gap-2">
                            {course.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs px-1 py-0 h-5">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/instructor/courses/${course.id}/edit`}>Edit Content</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Share Link</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1" title="Views">
                        <Eye className="h-3 w-3" />
                        {course.views || 0}
                    </div>
                    <div className="flex items-center gap-1" title="Lessons">
                        <BookOpen className="h-3 w-3" />
                        {course._count?.contents || 0}
                    </div>
                    <div className="flex items-center gap-1" title="Duration">
                        <Clock className="h-3 w-3" />
                        -- min
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
