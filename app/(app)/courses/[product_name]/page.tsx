import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function CoursePage({
    params,
}: {
    params: Promise<{ product_name: string }>;
}) {
    const title = formatToTitleCase((await params).product_name);

    const product = await getStripeProductByTitle(title);

    if (!product) {
        return redirect('/courses');
    }

    return (
        <div className="flex-1 p-4 lg:p-8">
        </div>
    );
}