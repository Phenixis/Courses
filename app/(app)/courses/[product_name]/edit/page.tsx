import { getUser } from "@/lib/db/queries";
import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function EditCoursePage({
    params,
}: {
    params: Promise<{ product_name: string }>;
}) {
    const { product_name } = await params;
    const user = await getUser();

    if (!user || user.role !== "admin") {
        return redirect(`/courses/${product_name}`);
    }

    const product = await getStripeProductByTitle(formatToTitleCase(product_name));

    if (!product) {
        return redirect("/courses");
    }

    return (
        <div className="h-full w-full flex justify-center items-center">
            <p>
                Select a chapter to edit it...
            </p>
        </div>
    );
}