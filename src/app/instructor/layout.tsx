import UserNav from '@/components/shared/user-nav';
import Link from 'next/link';
import { BookOpen, LayoutDashboard, BookMarked } from 'lucide-react';

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col" data-role="instructor">
            <header className="border-b h-16 flex items-center px-6 justify-between bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <div className="font-bold text-lg">LearnSphere</div>
                        <div className="text-xs text-emerald-600 font-medium">Instructor Studio</div>
                    </div>
                </div>

                <nav className="flex gap-1 text-sm font-medium">
                    <Link href="/instructor" className="px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link href="/instructor/courses" className="px-3 py-2 rounded-md hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2">
                        <BookMarked className="h-4 w-4" />
                        My Courses
                    </Link>
                </nav>

                <UserNav />
            </header>

            <main className="flex-1 p-6 bg-gradient-to-br from-teal-50 to-emerald-50/30 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
