'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Skeleton } from '../ui/skeleton';

export function SubmitButton({
    title,
    skeleton = false
}: {
    title: string,
    skeleton?: boolean
}) {
    const { pending } = useFormStatus();

    return skeleton ? (
        <Skeleton className="h-10 w-1/5 rounded-full" />
    ) : (
        <Button
            type="submit"
            disabled={pending}
            size="lg"
            className={`min-w-32 w-fit bg-gradient-to-r from-primary to-blue-500 hover:from-primary/80 hover:to-blue-500 active:scale-95 text-white rounded-full flex items-center justify-center font-bold px-6 py-3 transition-all duration-200 group/Action shadow-md shadow-primary/30 ${pending ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            aria-busy={pending}
        >
            {pending ? (
            <>
                Loading...
                <Loader2 className="animate-spin ml-2 h-5 w-5" aria-hidden="true" />
            </>
            ) : (
            <>
                <span className="relative block before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-full before:bg-white before:transform before:scale-x-0 before:origin-left before:transition-transform before:duration-300 group-hover/Action:before:scale-x-100">
                {title}
                </span>
                <ArrowRight className="ml-2 h-5 w-5 -translate-x-1 group-hover/Action:translate-x-1 duration-300" aria-hidden="true" />
            </>
            )}
        </Button>
    );
}
