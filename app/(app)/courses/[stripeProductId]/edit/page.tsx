import { getUser } from "@/lib/db/queries";
import { getStripeProductById } from "@/lib/payments/stripe";
import { redirect } from "next/navigation";
import { CourseEditor } from "./course-editor";

export default async function EditCoursePage({
    params,
} : {
    params: Promise<{ stripeProductId: string }>;
}) {
    const { stripeProductId } = await params;

    const user = await getUser();

    if (!user || user.role !== 'admin') {
        return redirect('/courses');
    }

    const product = await getStripeProductById(stripeProductId);

    if (!product) {
        return redirect('/courses');
    }

    return (
        <CourseEditor 
            stripeProductId={stripeProductId}
            courseName={product.name}
        />
    );
}