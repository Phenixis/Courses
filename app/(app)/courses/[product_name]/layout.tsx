import { getUser } from "@/lib/db/queries";
import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToSnakeCase, formatToTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import ChaptersSidebar from "@/components/products/chaptersSidebar";
import { getChaptersByProductId } from "@/lib/db/queries/chapter";
import { CourseHeader } from "@/components/products/courseHeader";

export default async function CourseLayout({
    params,
    children
}: {
    params: Promise<{ product_name: string }>;
    children: React.ReactNode;
}) {
    const title = formatToTitleCase((await params).product_name);
    const user = await getUser();

    const isAdmin = user !== null && user.role === "admin";

    if (!user) {
        return redirect('/courses');
    }

    const product = await getStripeProductByTitle(title);

    if (!product) {
        return redirect('/courses');
    }

    const chapters = await getChaptersByProductId(product.id);
    const productSlug = formatToSnakeCase(product.name);

    return (
        <div className="flex-1 p-4 lg:p-8 h-full">
            <CourseHeader productName={product.name} productSlug={productSlug} isAdmin={isAdmin} />
            <ChaptersSidebar
                chapters={chapters}
                title={product.name}
                isAdmin={isAdmin}
            >
                {children}
            </ChaptersSidebar>
        </div>
    );
}