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
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterForm() {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

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
                    setSuccess('Registration successful! Redirecting...');
                }
            });
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="John Doe"
                                    {...field}
                                    disabled={isPending}
                                    className="h-11 shadow-sm"
                                />
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
                            <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="name@example.com"
                                    type="email"
                                    {...field}
                                    disabled={isPending}
                                    className="h-11 shadow-sm"
                                />
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
                            <FormLabel className="text-sm font-medium">Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    disabled={isPending}
                                    className="h-11 shadow-sm"
                                />
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
                            <FormLabel className="text-sm font-medium">I am a...</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                <FormControl>
                                    <SelectTrigger className="h-11 shadow-sm">
                                        <SelectValue placeholder="Select your role" />
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
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-fade-in">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 animate-fade-in">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm text-emerald-700 font-medium">{success}</p>
                    </div>
                )}

                <Button type="submit" className="w-full h-11 font-medium mt-2" disabled={isPending}>
                    {isPending ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>
        </Form>
    );
}

