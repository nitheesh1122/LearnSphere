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
import { revokeInvitation } from '@/lib/actions/admin';
import { Trash } from 'lucide-react';

interface InvitationListProps {
    invitations: any[];
}

export default function InvitationList({ invitations }: InvitationListProps) {
    const [isPending, startTransition] = useTransition();

    const onRevoke = (id: string) => {
        if (confirm('Revoke this invitation?')) {
            startTransition(() => {
                revokeInvitation(id);
            });
        }
    };

    return (
        <div className="border rounded-md bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Invited By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invitations.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No invitations found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        invitations.map((inv) => (
                            <TableRow key={inv.id}>
                                <TableCell>{inv.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{inv.roleName}</Badge>
                                </TableCell>
                                <TableCell>{inv.course?.title || '-'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{inv.inviter.name}</span>
                                        <span className="text-xs text-muted-foreground">{inv.inviter.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={inv.status === 'ACCEPTED' ? 'default' : 'secondary'}>
                                        {inv.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(inv.expiresAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRevoke(inv.id)}
                                        disabled={isPending || inv.status === 'ACCEPTED'}
                                        className="text-destructive hover:text-destructive"
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
    );
}
