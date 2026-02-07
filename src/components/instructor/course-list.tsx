'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface CourseListProps {
    courses: any[];
}

export function CourseList({ courses }: CourseListProps) {
    return (
        <div className="border rounded-md bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[100px]">Price</TableHead>
                        <TableHead className="w-[100px]">Access</TableHead>
                        <TableHead className="w-[100px] text-center">Lessons</TableHead>
                        <TableHead className="w-[100px] text-center">Views</TableHead>
                        <TableHead className="w-[150px]">Last Updated</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                No courses found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{course.title}</span>
                                        <div className="flex gap-1 mt-1">
                                            {course.tags?.map((tag: string) => (
                                                <Badge key={tag} variant="outline" className="text-[10px] px-1 h-4">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={course.published ? 'default' : 'secondary'}>
                                        {course.published ? 'Published' : 'Draft'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {course.price ? `$${course.price}` : 'Free'}
                                </TableCell>
                                <TableCell className="capitalize">
                                    {course.accessType?.toLowerCase() || 'open'}
                                </TableCell>
                                <TableCell className="text-center">
                                    {course._count?.contents || 0}
                                </TableCell>
                                <TableCell className="text-center">
                                    {course.views || 0}
                                </TableCell>
                                <TableCell>
                                    {new Date(course.updatedAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Link href={`/instructor/courses/${course.id}/edit`}>
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
