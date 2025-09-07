import { Product } from "@/components/products/product";
import { ProductDisplay } from "@/components/products/productDisplay";
import { getUser } from "@/lib/db/queries";
import { getAccessByUserId } from "@/lib/db/queries/access";
import { getStripeProducts } from "@/lib/payments/stripe";
import { Suspense } from "react";

export default async function CoursesPage() {
    const user = await getUser();

    if (!user) {
        return <div>Please log in to view your courses.</div>;
    }

    const products = await getStripeProducts(true);

    const accessedProductIds = await getAccessByUserId(user.id);

    return (
        <div className="flex-1 p-4 lg:p-8">
            <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6">
                Courses
            </h1>
            <div className="flex flex-col items-center">
                {
                    products.filter(product => accessedProductIds.some(access => access.stripeProductId === product.id)).map(product => (
                        <div key={product.id} className="w-full max-w-7xl">
                            <Suspense key={product.id} fallback={<ProductDisplay />}>
                                <Product stripeProductId={product.id} />
                            </Suspense>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}