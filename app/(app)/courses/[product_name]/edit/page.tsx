import { getUser } from "@/lib/db/queries";
import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import ChaptersSidebar from "@/components/products/chaptersSidebar";

export default async function EditCoursePage({
    params,
}: {
    params: Promise<{ product_name: string }>;
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

    return (
        <div className="flex-1 p-4 lg:p-8">
            <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6">
                {product.name} [EDIT]
            </h1>
            <main className="flex">
                <ChaptersSidebar
                    chapters={[
                        {
                            id: 0,
                            title: 'Introduction',
                        },
                        {
                            id: 1,
                            title: 'Getting Started',
                        }
                    ]}
                    title={product.name}
                />
                {/* <TextEditor /> */}
            </main>
        </div>
    );
}