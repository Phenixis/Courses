import { getUser } from "@/lib/db/queries";
import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import ChaptersSidebar from "@/components/products/chaptersSidebar";
import ChapterEditor from "@/components/products/chapterEditor";
import { getChaptersByProductId } from "@/lib/db/queries/chapter";
import { Suspense } from "react";

export default async function EditCourseLayout({
    params,
    children
}: {
    params: Promise<{ product_name: string }>;
    children: React.ReactNode;
}) {
    const title = formatToTitleCase((await params).product_name);

    const user = await getUser();

    if (!user || user.role !== 'admin') {
        return redirect('/courses');
    }

    const product = await getStripeProductByTitle(title);

    if (!product) {
        return redirect('/courses');
    }

    const chapters = await getChaptersByProductId(product.id);

    return (
        <div className="flex-1 p-4 lg:p-8 h-full">
            <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6">
                {product.name} [EDIT]
            </h1>
            <ChaptersSidebar
                chapters={chapters}
                title={product.name}
            >
                {children}
            </ChaptersSidebar>
        </div>
    );
}