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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toggleUserStatus } from '@/lib/actions/admin';
import { User } from '@prisma/client';

type UserWithRoles = User & {
    roles: { role: { name: string } }[];
};

interface UserListProps {
    users: UserWithRoles[];
}

export default function UserList({ users }: UserListProps) {
    const [filterRole, setFilterRole] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [isPending, startTransition] = useTransition();

    const filteredUsers = users.filter((user) => {
        const matchesRole =
            filterRole === 'ALL' ||
            user.roles.some((r) => r.role.name === filterRole);
        const matchesSearch =
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const onToggleStatus = (userId: string, currentStatus: boolean) => {
        startTransition(() => {
            toggleUserStatus(userId, !currentStatus);
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                        <SelectItem value="LEARNER">Learner</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {user.roles.map((r) => (
                                                <Badge key={r.role.name} variant="outline">
                                                    {r.role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.isActive ? 'default' : 'destructive'}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={user.isActive}
                                            onCheckedChange={() =>
                                                onToggleStatus(user.id, user.isActive)
                                            }
                                            disabled={isPending}
                                        />
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
