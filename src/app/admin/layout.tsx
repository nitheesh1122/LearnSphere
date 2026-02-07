import UserNav from '@/components/shared/user-nav';
import Link from 'next/link';
import { BookOpen, LayoutDashboard, Users, BookMarked, GraduationCap, BarChart3, Mail } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col" data-role="admin">
            <header className="border-b h-16 flex items-center px-6 justify-between bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <div className="font-bold text-lg">LearnSphere</div>
                        <div className="text-xs text-indigo-600 font-medium">Admin Panel</div>
                    </div>
                </div>

                <nav className="flex gap-1 text-sm font-medium">
                    <Link href="/admin/dashboard" className="px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className="px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Users
                    </Link>
                    <Link href="/admin/courses" className="px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2">
                        <BookMarked className="h-4 w-4" />
                        Courses
                    </Link>
                    <Link href="/admin/enrollments" className="px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Enrollments
                    </Link>
                    <Link href="/admin/analytics" className="px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </Link>
                    <Link href="/admin/invitations" className="px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Invitations
                    </Link>
                </nav>

                <UserNav />
            </header>

            <main className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
