"use client";

import { Breadcrumb as Bc, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { formatToTitleCase, formatToSnakeCase } from '@/lib/utils';
import { FileWarning, TriangleAlert } from 'lucide-react';

export default function Breadcrumb() {
    const pathname = usePathname();

    return (
        <Bc className="px-4 lg:px-8 flex">
            <BreadcrumbList>
                {
                    pathname.split('/').map((path, index) => {
                        if (path === '') {
                            return (
                                <BreadcrumbItem key={index}>
                                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                                </BreadcrumbItem>
                            );
                        }

                        return (
                            <BreadcrumbItem key={index} className="pl-2 border-l">
                                {
                                    index === pathname.split('/').length - 1 ? (
                                        <BreadcrumbPage>{formatToTitleCase(path)}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={
                                            pathname.split('/').slice(0, index + 1).join('/')
                                        }>{formatToTitleCase(path)}</BreadcrumbLink>
                                    )
                                }
                            </BreadcrumbItem>
                        )
                    })
                }
            </BreadcrumbList>
            {
                pathname.endsWith('/edit') && (
                    <div className="text-sm text-yellow-700 bg-yellow-100 px-3 py-1 rounded ml-4 flex items-center gap-2">
                        <TriangleAlert className="h-4 w-4" />
                        <span>You are in edit mode. Don't forget to save your changes.</span>
                    </div>
                )
            }
        </Bc>
    )
}