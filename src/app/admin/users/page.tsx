import { getUsers } from '@/lib/actions/admin';
import UserList from '@/components/admin/user-list';

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <UserList users={users} />
        </div>
    );
}
