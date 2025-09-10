"use client";

import Logo from '@/components/big/logo';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { signIn as googleSignIn } from "next-auth/react"

function getTitle() {
    const pathname = usePathname();
    if (pathname.endsWith('/login')) {
        return 'Log In';
    } else if (pathname.endsWith('/sign-up')) {
        return 'Sign Up';
    } else {
        return 'Sign In';
    }
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const page = pathname.split('/').pop();
    const inviteId = searchParams.get('inviteId');
    const priceId = searchParams.get('priceId');
    const redirect = searchParams.get('redirect');


    return (
        <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex gap-4 items-center justify-center">
                <Logo />
                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {getTitle()}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="mt-6">
                    <Button
                        className="w-full flex justify-center items-center py-2 px-4 border rounded-full shadow-sm text-sm font-medium"
                        variant={"outline"}
                        onClick={() => googleSignIn("google", { redirectTo: `/api/auth/after_provider_sign_in?from=${page}&inviteId=${inviteId}&priceId=${priceId}&redirect=${redirect}` })}
                    >
                        <img src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" className="h-6 w-6 mr-2" alt="Google Logo" />
                        {getTitle()} with Google
                    </Button>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-50 text-gray-500">
                                    Rather use credentials?
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}

