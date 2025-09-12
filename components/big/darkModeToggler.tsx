'use client';

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '../ui/button';

export default function DarkModeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Small helpers to read/write the 'theme' cookie from the browser.
    // We prefer a cookie to keep SSR (server) and CSR (client) in sync.
    const setThemeCookie = (theme: 'light' | 'dark') => {
        try {
            // Persist for 1 year; path=/ so it's available app-wide
            const maxAge = 60 * 60 * 24 * 365;
            document.cookie = `theme=${theme}; path=/; max-age=${maxAge}`;
        } catch {
            // No-op: if cookies are disabled, we still toggle class client-side
        }
    };
    const getThemeCookie = (): 'light' | 'dark' | null => {
        try {
            const match = document.cookie.match(/(?:^|; )theme=([^;]+)/);
            const value = match ? decodeURIComponent(match[1]) : null;
            return value === 'dark' || value === 'light' ? value : null;
        } catch {
            return null;
        }
    };

    const toggleDarkMode = () => {
        const nextIsDark = !isDarkMode;
        setIsDarkMode(nextIsDark);

        // Toggle class on <html> for Tailwind's dark mode
        if (nextIsDark) {
            document.documentElement.classList.add('dark');
            setThemeCookie('dark');
        } else {
            document.documentElement.classList.remove('dark');
            setThemeCookie('light');
        }
    }

    useEffect(() => {
        // Initialize from cookie if present, otherwise read current DOM class.
        // Root layout sets the class from the cookie on SSR to avoid FOUC.
        const cookieTheme = getThemeCookie();
        const initialIsDark = cookieTheme
            ? cookieTheme === 'dark'
            : document.documentElement.classList.contains('dark');

        setIsDarkMode(initialIsDark);

        // Ensure the class matches the resolved initial state (idempotent)
        if (initialIsDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [])

    return (
        <Button
            variant={"ghost"}
            size={"icon"}
            onClick={toggleDarkMode}
            className="group/DarkMode"
        >
            {isDarkMode ? (
                <Moon className="group-hover/DarkMode:rotate-[30deg] duration-300 size-4 lg:size-6" />
            ) : (
                <Sun className="group-hover/DarkMode:rotate-[30deg] duration-300 size-4 lg:size-6" />
            )}
        </Button>
    )
}