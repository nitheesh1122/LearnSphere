import UserNav from '@/components/shared/user-nav';
import Link from 'next/link';
import { BookOpen, GraduationCap, Library } from 'lucide-react';

export default function LearnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col" data-role="learner">
            <header className="border-b h-16 flex items-center px-6 justify-between bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-bold text-lg">LearnSphere</div>
                        <div className="text-xs text-blue-600 font-medium">Learning Hub</div>
                    </div>
                </div>

                <nav className="flex gap-1 text-sm font-medium">
                    <Link href="/learner" className="px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        My Learning
                    </Link>
                    <Link href="/learner/catalog" className="px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2">
                        <Library className="h-4 w-4" />
                        Catalog
                    </Link>
                </nav>

                <UserNav />
            </header>

            <main className="flex-1 p-6 bg-gradient-to-br from-violet-50 to-blue-50/30 animate-fade-in">
                {children}
            </main>
        </div>
    );
}
