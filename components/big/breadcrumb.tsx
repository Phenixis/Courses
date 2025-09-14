"use client";

import { Breadcrumb as Bc, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { formatToTitleCase, formatToSnakeCase } from '@/lib/utils';

export default function Breadcrumb() {
    const pathname = usePathname();

    return (
        <Bc className="px-4 lg:px-8">
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
        </Bc>
    )
}