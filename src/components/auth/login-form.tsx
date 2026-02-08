'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

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
