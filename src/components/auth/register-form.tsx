'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterFormSchema } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { register } from '@/lib/actions';
import { useState, useTransition } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof RegisterFormSchema>>({
        resolver: zodResolver(RegisterFormSchema),
        defaultValues: {
            email: '',
            password: '',
            name: '',
            role: 'LEARNER'
        },
    });

    const onSubmit = (values: z.infer<typeof RegisterFormSchema>) => {
        setError('');
        setSuccess('');

        startTransition(() => {
            register(values).then((data) => {
                if (data?.error) {
                    setError(data.error);
                } else {
                    // success handled by redirect in action
                    setSuccess('Registration successful! Redirecting...');
                }
            });
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="m@example.com" type="email" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="LEARNER">Learner</SelectItem>
                                    <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error && (
                    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                        <p>{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
                        <p>{success}</p>
                    </div>
                )}
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Registering...' : 'Create Account'}
                </Button>
            </form>
        </Form>
    );
}
