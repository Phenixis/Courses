"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type CourseHeaderProps = {
    productName: string;
    productSlug: string;
    isAdmin: boolean;
};

export function CourseHeader({ productName, productSlug, isAdmin }: CourseHeaderProps) {
    const pathname = usePathname();
    const inEdit = pathname.includes("/edit");

    return (
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6">
            {productName}
            {inEdit ? (
                " - [EDIT]"
            ) : (
                isAdmin && (
                    <Link href={`/courses/${productSlug}/edit`}>
                        <Button variant="outline" className="ml-4 flex-end">
                            Edit
                        </Button>
                    </Link>
                )
            )}
        </h1>
    );
}
