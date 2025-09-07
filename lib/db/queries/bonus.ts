import * as lib from "./library"
import { bonusTable, Bonus, NewBonus } from "../schema/bonus";

export async function getBonusesByProductId(stripeProductId: string): Promise<Bonus[]> {
    return await lib.db.
    select()
    .from(bonusTable)
    .where(lib.eq(bonusTable.stripeProductId, stripeProductId))
    .orderBy(lib.asc(bonusTable.id)) as Bonus[];
}

export async function createBonus(data: NewBonus): Promise<Bonus> {
    const [bonus] = await lib.db.insert(bonusTable).values(data).returning();
    return bonus;
}

export async function updateBonus(id: number, data: Partial<NewBonus>): Promise<Bonus | null> {
    const [bonus] = await lib.db.update(bonusTable).set(data).where(lib.eq(bonusTable.id, id)).returning();
    return bonus || null;
}

export async function deleteBonus(id: number): Promise<void> {
    await lib.db.delete(bonusTable).where(lib.eq(bonusTable.id, id));
}