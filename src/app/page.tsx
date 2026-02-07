import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-black">
      <main className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">LearnSphere</h1>
        <p className="text-lg text-gray-600">Enterprise Learning Management System</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
