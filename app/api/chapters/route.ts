import { NextResponse } from "next/server";
import { getUser } from "@/lib/db/queries";
import { createChapter, getNextChapterNumero } from "@/lib/db/queries/chapter";

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const stripeProductId = typeof body.stripeProductId === "string" ? body.stripeProductId.trim() : "";
        const providedTitle = typeof body.title === "string" ? body.title.trim() : "";
        const providedContent = typeof body.content === "string" ? body.content : "";

        if (!stripeProductId) {
            return NextResponse.json({ error: "stripeProductId is required" }, { status: 400 });
        }

        const nextNumero = await getNextChapterNumero(stripeProductId);
        const title = (providedTitle || `Chapter ${nextNumero}`).slice(0, 255);
        const content = providedContent;

        const chapter = await createChapter({
            stripeProductId,
            numero: nextNumero,
            title,
            content,
            published: false,
        });

        return NextResponse.json(chapter, { status: 201 });
    } catch (error) {
        console.error("POST /api/chapters error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
