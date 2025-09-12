import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getBonusesByProductId } from "@/lib/db/queries/bonus";
import { getChaptersByProductId } from "@/lib/db/queries/chapter";
import { getStripeProducts, getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToSnakeCase, formatToTitleCase } from "@/lib/utils";

export async function generateStaticParams() {
    const products = await getStripeProducts(true);

    return products.map((product) => ({
        product_name: formatToSnakeCase(product.name)
    }));
}

export default async function ProductLandingPage({
    params
}: {
    params: Promise<{ product_name: string }>
}
) {
    const title = formatToTitleCase((await params).product_name);
    const product = await getStripeProductByTitle(title);

    if (!product) {
        return <div>Product not found</div>;
    }

    const chapters = await getChaptersByProductId(product.id);
    const bonuses = await getBonusesByProductId(product.id);

    return (
        <main className='min-h-screen bg-gray-50'>
            <div className="max-w-7xl mx-auto py-12 space-y-12">
                <header className='p-4 flex items-center'>
                    <div className="w-2/3">
                        <h1 className="text-6xl font-light underline underline-offset-4 decoration-2">
                            {title}
                        </h1>
                        <h2 className="text-4xl font-light">
                            {product.description}
                        </h2>
                    </div>
                    {product.images[0] ? (
                        <aside className="w-1/4 ml-8">
                            <AspectRatio ratio={21 / 29.7} className="w-full h-full">
                                <img src={product.images[0]} alt="Product Image" className="w-full h-full border-2 rounded bg-slate-200 dark:bg-slate-700" />
                            </AspectRatio>
                        </aside>
                    ) : null}
                </header>
                <pre>{JSON.stringify(product, null, 2)}</pre>
                <h2>Chapters</h2>
                <pre>{JSON.stringify(chapters, null, 2)}</pre>
                <h2>Bonuses</h2>
                <pre>{JSON.stringify(bonuses, null, 2)}</pre>
            </div>
        </main >
    );
}