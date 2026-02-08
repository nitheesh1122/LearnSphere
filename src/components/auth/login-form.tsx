'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for redirect parameter after successful login
    useEffect(() => {
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
            router.push(redirectUrl);
        }
    }, [router, searchParams]);

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
            </div>
            <div className="flex flex-col gap-2">
                <LoginButton />
                {errorMessage && (
                    <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
                )}
            </div>
        </form>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button aria-disabled={pending} type="submit" className="w-full">
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    );
}
