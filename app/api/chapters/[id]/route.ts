import { NextResponse } from "next/server";
import { deleteChapter, getChapterById, updateChapter } from "@/lib/db/queries/chapter";
import { getUser } from "@/lib/db/queries";

export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const params = await context.params;
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idNum = Number(params.id);
        if (!Number.isFinite(idNum)) {
            return NextResponse.json({ error: "Invalid chapter id" }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));
        // Whitelist fields that can be updated from the editor
        const { title, content, numero, stripeProductId, published } = body as {
            title?: string;
            content?: string | null;
            numero?: number;
            stripeProductId?: string;
            published?: boolean;
        };

        const data: any = {};
        if (typeof title === "string") data.title = title;
        if (typeof content === "string" || content === null) data.content = content;
        if (typeof numero === "number") data.numero = numero;
        if (typeof stripeProductId === "string") data.stripeProductId = stripeProductId;
        if (typeof published === "boolean") data.published = published;

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
        }

        const updated = await updateChapter(idNum, data);
        if (!updated) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (err) {
        console.error("PATCH /api/chapters/[id] error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> },
) {
    try {
        const params = await context.params;
        const user = await getUser();
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idNum = Number(params.id);
        if (!Number.isFinite(idNum)) {
            return NextResponse.json({ error: "Invalid chapter id" }, { status: 400 });
        }

        const existing = await getChapterById(idNum);
        if (!existing) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
        }

        await deleteChapter(idNum);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("DELETE /api/chapters/[id] error", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
