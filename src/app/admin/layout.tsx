import UserNav from '@/components/shared/user-nav';
import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b h-16 flex items-center px-6 justify-between bg-white text-black">
                <div className="font-bold text-xl">LearnSphere Admin</div>
                <nav className="flex gap-4 text-sm font-medium">
                    <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link>
                    <Link href="/admin/users" className="hover:underline">Users</Link>
                    <Link href="/admin/courses" className="hover:underline">Courses</Link>
                    <Link href="/admin/enrollments" className="hover:underline">Enrollments</Link>
                    <Link href="/admin/analytics" className="hover:underline">Analytics</Link>
                    <Link href="/admin/invitations" className="hover:underline">Invitations</Link>
                </nav>
                <UserNav />
            </header>
            <main className="flex-1 p-6 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
