import * as lib from "./library"
import { accessTable, Access, NewAccess } from "../schema/access";

export async function getAccessByUserId(userId: string): Promise<Access[]> {
    return await lib.db.
    select()
    .from(accessTable)
    .where(lib.eq(accessTable.userId, userId))
    .orderBy(lib.asc(accessTable.id)) as Access[];
}

export async function getAccessByProductId(stripeProductId: string): Promise<Access[]> {
    return await lib.db.
    select()
    .from(accessTable)
    .where(lib.eq(accessTable.stripeProductId, stripeProductId))
    .orderBy(lib.asc(accessTable.id)) as Access[];
}

export async function getAccessByPriceId(stripePriceId: string): Promise<Access[]> {
    return await lib.db.
    select()
    .from(accessTable)
    .where(lib.eq(accessTable.stripePriceId, stripePriceId))
    .orderBy(lib.asc(accessTable.id)) as Access[];
}

export async function createAccess(data: NewAccess): Promise<Access> {
    const [access] = await lib.db.insert(accessTable).values(data).returning() as Access[];
    return access;
}

export async function deleteAccess(id: number): Promise<void> {
    await lib.db.delete(accessTable).where(lib.eq(accessTable.id, id));
}