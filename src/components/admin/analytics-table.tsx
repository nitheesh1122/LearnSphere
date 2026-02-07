'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface AnalyticsTableProps {
    data: any[];
}

export default function AnalyticsTable({ data }: AnalyticsTableProps) {
    return (
        <div className="border rounded-md bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course Title</TableHead>
                        <TableHead className="text-center">Total Enrolled</TableHead>
                        <TableHead className="text-center">Completed</TableHead>
                        <TableHead className="text-center">Drop-off</TableHead>
                        <TableHead className="text-right">Completion Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No data available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell className="text-center">{item.totalEnrollments}</TableCell>
                                <TableCell className="text-center">{item.completed}</TableCell>
                                <TableCell className="text-center">{item.dropOff}</TableCell>
                                <TableCell className="text-right">{item.completionRate}%</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
