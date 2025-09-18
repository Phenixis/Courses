import { getUser } from "@/lib/db/queries";
import { getStripeProductByTitle } from "@/lib/payments/stripe";
import { formatToTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import ChaptersSidebar from "@/components/products/chaptersSidebar";
import ChapterEditor from "@/components/products/chapterEditor";
import { getChaptersByProductId } from "@/lib/db/queries/chapter";
import { Suspense } from "react";

export default async function EditCoursePage({
    params,
}: {
    params: Promise<{ product_name: string }>;
}) {
    return (
        <div className="h-full w-full flex justify-center items-center">
            <p>
                Select a chapter to edit it...
            </p>
        </div>
    );
}