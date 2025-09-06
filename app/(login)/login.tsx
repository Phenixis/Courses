'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn, signUp, validateEmail } from './actions';
import { ActionState } from '@/lib/auth/middleware';

// Only keep the correct Login function implementation below
export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' | 'login' }) {
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const priceId = searchParams.get('priceId');
    const inviteId = searchParams.get('inviteId');

    // For 'login' mode, handle email validation and conditional password rendering
    const [emailValidated, setEmailValidated] = useState(0); // 0: not validated, 1: existing, 2: new, -1: provider error
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // Select action based on mode
    const [state, formAction, pending] = useActionState<ActionState, FormData>(
        mode === 'login'
            ? (emailValidated === 0
                ? async (state, data) => {
                    const email = data.get('email');
                    if (email && typeof email === 'string') {
                        setEmail(email);
                        const result = await validateEmail(email);
                        setEmailValidated(result);
                        setError(
                            result === -1 ? "You signed in with a provider. Please sign in with the same provider." : ''
                        );
                    }
                    return state;
                }
                : emailValidated === 1 ? signIn : signUp)
            : mode === 'signin' ? signIn : signUp,
        { error: '' }
    );

    // UI titles and button text
    const getButtonText = () => {
        if (pending) return (<><Loader2 className="animate-spin mr-2 h-4 w-4" />Loading...</>);
        if (mode === 'login') {
            if (emailValidated === 0) return 'Continue';
            if (emailValidated === 1) return 'Log to your account';
            if (emailValidated === 2) return 'Create an account';
        }
        return mode === 'signin' ? 'Sign in' : 'Sign up';
    };

    // Navigation links
    const getAltLink = () => {
        if (mode === 'login') {
            return (
                <Link
                    href={`/sign-up${Array.from(searchParams.entries()).map(([key, value], idx) => `${idx === 0 ? '?' : '&'}${key}=${value}`).join('')}`}
                    className="text-sm text-gray-600 hover:text-gray-900 hover:dark:text-gray-100 hover:underline"
                >
                    Back to our old login flow
                </Link>
            );
        }
        return (
            <Link
                href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${Array.from(searchParams.entries()).map(([key, value], idx) => `${idx === 0 ? '?' : '&'}${key}=${value}`).join('')}`}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary basis-2/5"
            >
                {mode === 'signin' ? 'Create an account' : 'Sign in to existing account'}
            </Link>
        );
    };

    const getTryNewFlowLink = () => {
        if (mode !== 'login') {
            return (
                <Link
                    href={`/login${Array.from(searchParams.entries()).map(([key, value], idx) => `${idx === 0 ? '?' : '&'}${key}=${value}`).join('')}`}
                    className="text-sm text-gray-600 hover:text-gray-900 hover:dark:text-gray-100 hover:underline"
                >
                    Try our new login flow
                </Link>
            );
        }
        return null;
    };

    return (

        <form className="space-y-6" action={formAction}>
            <input type="hidden" name="redirect" value={redirect || ''} />
            <input type="hidden" name="priceId" value={priceId || ''} />
            <input type="hidden" name="inviteId" value={inviteId || ''} />
            <div>
                <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                >
                    Email
                </Label>
                <div className="mt-1">
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={50}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder="Enter your email"
                        defaultValue={mode === 'login' ? email : undefined}
                        onChange={mode === 'login' ? () => { setEmailValidated(0); setError(''); } : undefined}
                    />
                </div>
            </div>

            {/* Password field logic for 'login' mode */}
            {mode === 'login' ? (
                <div className={`${emailValidated > 0 ? 'block' : 'hidden'}`}>
                    <Label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </Label>
                    <div className="mt-1">
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={
                                emailValidated === 1 ? 'current-password' : 'new-password'
                            }
                            required={emailValidated > 0}
                            minLength={8}
                            maxLength={100}
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <Label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </Label>
                    <div className="mt-1">
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={
                                mode === 'signin' ? 'current-password' : 'new-password'
                            }
                            required
                            minLength={8}
                            maxLength={100}
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                            placeholder="Enter your password"
                        />
                    </div>
                </div>
            )}

            {state?.error && (
                <div className="text-red-500 text-sm">{state.error}</div>
            )}
            {mode === 'login' && error && (
                <div className="text-gray-500 text-sm">{error}</div>
            )}

            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:space-x-2">
                <Button
                    type="submit"
                    className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-primary/90 hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${mode !== 'login' ? 'basis-3/5' : ''}`}
                    disabled={pending || (mode === 'login' && emailValidated < 0)}
                >
                    {getButtonText()}
                </Button>
                {mode !== 'login' && getAltLink()}
            </div>

            <div className="flex items-center justify-center">
                {mode === 'login' ? getAltLink() : getTryNewFlowLink()}
            </div>
        </form>
    );
}