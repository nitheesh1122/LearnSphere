import UserNav from '@/components/shared/user-nav';
import Link from 'next/link';

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b h-16 flex items-center px-6 justify-between bg-white text-black">
                <Link href="/" className="font-bold text-xl hover:opacity-80 transition-opacity">
                    LearnSphere Instructor
                </Link>
                <nav className="flex gap-4 text-sm font-medium">
                    <Link href="/instructor" className="hover:underline">Dashboard</Link>
                    <Link href="/instructor/courses" className="hover:underline">My Courses</Link>
                </nav>
                <UserNav />
            </header>
            <main className="flex-1 p-6 bg-gray-50">
                {children}
            </main>
        </div>
    );
}
