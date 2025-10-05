import { getUser } from "@/lib/db/queries";
import { getChapterByProductIdAndNumero, getChaptersByProductId } from "@/lib/db/queries/chapter";
import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Editor } from "./editor";

export default async function EditCoursePage({
    params,
}: {
    params: Promise<{ product_name: string, chapterNumber: string }>;
}) {
    const { product_name, chapterNumber } = await params;
    let chapterNumberInt = 0;

    try {
        chapterNumberInt = parseInt(chapterNumber, 10);
    } catch (e) {
        chapterNumberInt = NaN;
    }

    if (isNaN(chapterNumberInt) || chapterNumberInt < 1) {
        return redirect(`/courses/${product_name}/edit`);
    }

    const title = formatToTitleCase(product_name);

    const user = await getUser();

    if (!user || user.role !== 'admin') {
        return redirect('/courses');
    }

    const product = await getStripeProductByTitle(title);

    if (!product) {
        return redirect('/courses');
    }

    const chapter = await getChapterByProductIdAndNumero(product.id, chapterNumberInt);

    if (!chapter) {
        return redirect(`/courses/${product_name}/edit`);
    }

    return (
        <Editor chapter={chapter} />
    )
}
