import { getStripeProductById } from "@/lib/payments/stripe";
import { redirect } from "next/navigation";

export default async function CoursePage({
    params,
} : {
    params: Promise<{ stripeProductId: string }>;
}) {
    const { stripeProductId } = await params;

    const product = await getStripeProductById(stripeProductId);

    if (!product) {
        return redirect('/courses');
    }

    return (
        <div className="flex-1 p-4 lg:p-8">
            <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6">
                {product.name}
            </h1>
        </div>
    );
}