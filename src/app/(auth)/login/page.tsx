import LoginForm from '@/components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Login</h1>
                <p className="text-gray-500">Enter your email below to login to your account</p>
            </div>
            <LoginForm />
            <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="underline">
                    Sign up
                </Link>
            </div>
        </div>
    );
}
