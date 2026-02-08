'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface EnrollmentListProps {
    enrollments: any[];
}

export default function EnrollmentList({ enrollments }: EnrollmentListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = enrollments.filter((e) =>
        e.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search user or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Enrolled Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Completion Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No enrollments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((e) => (
                                <TableRow key={e.userId + e.courseId}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{e.user.name}</span>
                                            <span className="text-xs text-muted-foreground">{e.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{e.course.title}</TableCell>
                                    <TableCell>{new Date(e.enrolledAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={e.completedAt ? 'default' : 'secondary'}>
                                            {e.completedAt ? 'Completed' : 'In Progress'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {e.completedAt ? new Date(e.completedAt).toLocaleDateString() : '-'}
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
