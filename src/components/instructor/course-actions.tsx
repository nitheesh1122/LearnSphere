'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { deleteCourse } from '@/lib/actions/course';

interface CourseActionsProps {
    courseId: string;
}

export function CourseActions({ courseId }: CourseActionsProps) {
    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            await deleteCourse(courseId);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <Link href={`/instructor/courses/${courseId}`}>
                    <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                    </DropdownMenuItem>
                </Link>
                <Link href={`/instructor/courses/${courseId}/edit`}>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                </Link>
                <Link href={`/instructor/courses/${courseId}/analytics`}>
                    <DropdownMenuItem>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
