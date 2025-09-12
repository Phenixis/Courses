'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { forgotPassword, resetPassword } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import Link from 'next/link';

export function ForgotPasswordForm() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session-id');

    // If we have a session-id, show the reset password form
    // Otherwise, show the forgot password form
    const isResetMode = !!sessionId;

    const [state, formAction, pending] = useActionState<ActionState, FormData>(
        isResetMode ? resetPassword : forgotPassword,
        { error: '' }
    );

    if (isResetMode) {
        return (
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Reset Your Password
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Enter your new password below
                    </p>
                </div>

                <form className="space-y-6" action={formAction}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    
                    <div>
                        <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            New Password
                        </Label>
                        <div className="mt-1">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                maxLength={100}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Enter your new password"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 8 characters long
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                        </Label>
                        <div className="mt-1">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                maxLength={100}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Confirm your new password"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="text-red-500 text-sm">{state.error}</div>
                    )}

                    {state?.success && (
                        <div className="text-green-500 text-sm">{state.success}</div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary/90 hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            disabled={pending}
                        >
                            {pending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Resetting Password...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </Button>
                    </div>

                    {state?.success && (
                        <div className="text-center">
                            <Link
                                href="/sign-in"
                                className="text-sm text-primary hover:text-primary/80 hover:underline"
                            >
                                Sign in with your new password
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Forgot Your Password?
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Enter your email address and we'll send you a link to reset your password
                </p>
            </div>

            <form className="space-y-6" action={formAction}>
                <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </Label>
                    <div className="mt-1">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            maxLength={255}
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            placeholder="Enter your email address"
                        />
                    </div>
                </div>

                {state?.error && (
                    <div className="text-red-500 text-sm">{state.error}</div>
                )}

                {state?.success && (
                    <div className="text-green-500 text-sm">{state.success}</div>
                )}

                <div>
                    <Button
                        type="submit"
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary/90 hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        disabled={pending}
                    >
                        {pending ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Sending Reset Link...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </div>

                <div className="text-center">
                    <Link
                        href="/sign-in"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:dark:text-gray-100 hover:underline"
                    >
                        Back to Sign In
                    </Link>
                </div>
            </form>
        </div>
    );
}