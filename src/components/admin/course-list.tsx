'use client';

import { useState, useTransition } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { adminTogglePublish, adminDeleteCourse } from '@/lib/actions/admin';
import { Eye, Trash } from 'lucide-react';

interface CourseListProps {
    courses: any[];
}

export default function CourseList({ courses }: CourseListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isPending, startTransition] = useTransition();

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onTogglePublish = (courseId: string, currentStatus: boolean) => {
        startTransition(() => {
            adminTogglePublish(courseId, !currentStatus);
        });
    };

    const onDelete = (courseId: string) => {
        if (confirm('Are you sure you want to delete this course? It will be hidden from everyone.')) {
            startTransition(() => {
                adminDeleteCourse(courseId);
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search courses or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-center">Lessons</TableHead>
                            <TableHead className="text-center">Students</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No courses found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCourses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">{course.title}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{course.instructor.name}</span>
                                            <span className="text-xs text-muted-foreground">{course.instructor.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={course.published ? 'default' : 'secondary'}>
                                                {course.published ? 'Published' : 'Draft'}
                                            </Badge>
                                            <Switch
                                                checked={course.published}
                                                onCheckedChange={() => onTogglePublish(course.id, course.published)}
                                                disabled={isPending}
                                                className="scale-75"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {course.price ? `$${course.price}` : 'Free'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {course._count.contents}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {course._count.enrollments}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(course.id)}
                                            className="text-destructive hover:text-destructive"
                                            disabled={isPending}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
