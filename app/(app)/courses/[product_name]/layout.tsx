import { getUser } from "@/lib/db/queries";
import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToSnakeCase, formatToTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import ChaptersSidebar from "@/components/products/chaptersSidebar";
import { getChaptersByProductId } from "@/lib/db/queries/chapter";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CourseLayout({
    params,
    children
}: {
    params: Promise<{ product_name: string }>;
    children: React.ReactNode;
}) {
    const title = formatToTitleCase((await params).product_name);
    const user = await getUser();

    const pathname = (await headers()).get('x-current-path') || '';
    const inEdit = pathname.includes('/edit');
    const isAdmin = user !== null && user.role === "admin";

    if (!user || (inEdit && !isAdmin)) {
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
                {product.name}
                {
                    inEdit ? ' - [EDIT]' :
                        isAdmin && (
                            <Link href={`/courses/${formatToSnakeCase(title)}/edit`}>
                                <Button variant="outline" className="ml-4 flex-end">
                                    Edit
                                </Button>
                            </Link>
                        )
                }
            </h1>
            <ChaptersSidebar
                chapters={chapters}
                title={product.name}
                isInEdit={inEdit}
            >
                {children}
            </ChaptersSidebar>
        </div>
    );
}