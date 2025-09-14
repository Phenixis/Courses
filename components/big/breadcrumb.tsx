"use client";

import { Breadcrumb as Bc, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { formatToTitleCase, formatToSnakeCase } from '@/lib/utils';
import { FileWarning, TriangleAlert } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Breadcrumb() {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    return (
        <Bc className="px-4 lg:px-8 lg:flex space-y-2 lg:space-y-0 lg:gap-2">
            <BreadcrumbList className="gap-0 sm:gap-0">
                {
                    pathname.split('/').map((path, index) => {
                        if (path === '') {
                            return (
                                <BreadcrumbItem key={index} className="px-2 border-r">
                                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                                </BreadcrumbItem>
                            );
                        }

                        return (
                            // Mobile: show "..." between first and last breadcrumb
                            // Desktop: show all breadcrumbs

                            (() => {
                                const segments = pathname.split('/');
                                const isFirst = index === 0;
                                const isLast = index === (segments.length - 1);

                                if (isMobile && segments.length >= 3 && !isFirst && !isLast) {
                                    if (index === 1) {
                                        return (
                                            <BreadcrumbItem key={index} className="px-2 border-r">
                                                <span className="text-gray-400">...</span>
                                            </BreadcrumbItem>
                                        );
                                    }
                                    return null;
                                }

                                if (isLast) {
                                    return <BreadcrumbPage key={index} className="px-2">
                                        {formatToTitleCase(path)}
                                    </BreadcrumbPage>;
                                }

                                return (
                                    <BreadcrumbLink key={index} className="px-2 border-r" href={segments.slice(0, index + 1).join('/')}>
                                        {formatToTitleCase(path)}
                                    </BreadcrumbLink>
                                );
                            })()
                        )
                    })
                }
            </BreadcrumbList>
            {
                pathname.endsWith('/edit') && (
                    <div className="text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded  flex items-center gap-2">
                        <TriangleAlert className="h-4 w-4" />
                        <span>You are in edit mode. Don't forget to save your changes.</span>
                    </div>
                )
            }
        </Bc>
    )
}