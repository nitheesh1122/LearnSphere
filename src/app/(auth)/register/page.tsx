import RegisterForm from '@/components/auth/register-form';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-3 text-center">
                <div className="flex justify-center mb-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                        <span className="text-2xl font-bold">LearnSphere</span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Create Your Account</h1>
                <p className="text-muted-foreground">Start your learning journey today</p>
            </div>

            <RegisterForm />

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
