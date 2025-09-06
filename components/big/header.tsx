'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useValues } from '@/lib/auth';
import Logo from '@/components/big/logo';
import DarkModeToggle from './darkModeToggler';
import Feedback from '@/components/feedback/feedback';
import UserAvatar from './userAvatar';

export default function Header({
    fullWidth
}: {
    fullWidth?: boolean
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, setUser } = useValues();

    return (
        <header className="border-b border-gray-200 dark:border-gray-700">
            <div className={`${fullWidth ? "" : "max-w-7xl"} mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center`}>
                <Logo title />
                <Feedback />
                <div className="flex items-center space-x-4">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:dark:text-gray-100"
                    >
                        Products
                    </Link>
                    <DarkModeToggle />
                    {user ? (
                        <UserAvatar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} setUser={setUser} />
                    ) : (
                        <Button
                            asChild
                            className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
                        >
                            <Link href="/sign-up">Sign Up</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}