'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Lock, Bell, Shield, Eye, EyeOff } from 'lucide-react';
import { auth } from '@/auth';

export default function LearnerSettings() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useState(() => {
        const fetchUser = async () => {
            try {
                const session = await auth();
                setUser(session?.user);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        emailNotifications: true,
        profileVisibility: 'public' as 'public' | 'private',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const target = e.target;
        if ('checked' in target) {
            const { name, checked } = target as HTMLInputElement;
            setFormData(prev => ({ 
                ...prev, 
                [name]: checked 
            }));
        } else {
            const { name, value } = target as HTMLSelectElement;
            setFormData(prev => ({ 
                ...prev, 
                [name]: value 
            }));
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement profile update API
        console.log('Profile update:', formData);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement password change API
        console.log('Password change:', formData);
    };

    const handleEmailPreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement email preferences API
        console.log('Email preferences:', formData);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                />
                            </div>
                        </form>
                        <div className="pt-4">
                            <Button className="w-full">
                                Update Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </form>
                        <div className="pt-4 space-y-2">
                            <Button className="w-full">
                                Change Password
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Mail className="mr-2 h-4 w-4" />
                                Forgot Password?
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Email Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Email Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleEmailPreferences} className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="emailNotifications"
                                    checked={formData.emailNotifications}
                                    onChange={(e) => handleInputChange({
                                        target: { name: 'emailNotifications', value: e.target.checked }
                                    })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="emailNotifications" className="text-sm font-medium">
                                    Email Notifications
                                </Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                                <select
                                    id="profileVisibility"
                                    name="profileVisibility"
                                    value={formData.profileVisibility}
                                    onChange={handleSelectChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </form>
                        <div className="pt-4">
                            <Button className="w-full">
                                Save Preferences
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Account Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                <EyeOff className="mr-2 h-4 w-4" />
                                Deactivate Account
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                                <Lock className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
