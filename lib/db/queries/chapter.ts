import * as lib from "./library"
import { chapterTable, Chapter, NewChapter } from "../schema/chapter";

export async function getChaptersByProductId(stripeProductId: string, published?: boolean): Promise<Chapter[]> {
    return await lib.db.
    select()
    .from(chapterTable)
    .where(lib.eq(chapterTable.stripeProductId, stripeProductId))
    .orderBy(lib.asc(chapterTable.numero));
}

export async function getChapterByProductIdAndNumero(stripeProductId: string, numero: number): Promise<Chapter | null> {
    return await lib.db
    .select()
    .from(chapterTable)
    .where(
        lib.and(
            lib.eq(chapterTable.stripeProductId, stripeProductId),
            lib.eq(chapterTable.numero, numero)
        )
    )
    .limit(1)
    .then(rows => rows[0] || null);
}

export async function createChapter(data: NewChapter): Promise<Chapter> {
    const [chapter] = await lib.db.insert(chapterTable).values(data).returning();
    return chapter;
}

export async function updateChapter(id: number, data: Partial<NewChapter>): Promise<Chapter | null> {
    const [chapter] = await lib.db.update(chapterTable).set(data).where(lib.eq(chapterTable.id, id)).returning();
    return chapter || null;
}

export async function deleteChapter(id: number): Promise<void> {
    await lib.db.delete(chapterTable).where(lib.eq(chapterTable.id, id));
}