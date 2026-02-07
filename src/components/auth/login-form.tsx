'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <form action={dispatch} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    className="h-11"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                    className="h-11"
                />
            </div>

            {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                </div>
            )}

            <LoginButton />
        </form>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            aria-disabled={pending}
            type="submit"
            className="w-full h-11 font-medium"
            disabled={pending}
        >
            {pending ? 'Signing in...' : 'Sign In'}
        </Button>
    );
}
