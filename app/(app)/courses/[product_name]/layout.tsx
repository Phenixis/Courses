import { getUser } from "@/lib/db/queries";
import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToTitleCase } from "@/lib/utils";
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
    const { product_name } = await params;
    const productSlug = product_name;
    const title = formatToTitleCase(productSlug);
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

    return (
        <div className="flex-1 p-4 lg:p-8 h-full">
            <CourseHeader productName={product.name} productSlug={productSlug} isAdmin={isAdmin} />
            <ChaptersSidebar
                chapters={chapters}
                title={product.name}
                isAdmin={isAdmin}
                stripeProductId={product.id}
                productSlug={productSlug}
            >
                {children}
            </ChaptersSidebar>
        </div>
    );
}