import { ActivityType } from "../schema";
import { Access, accessTable, NewAccess } from "../schema/access";
import { logActivity } from "./activity-log";
import * as lib from "./library";
import { getTeamForUser } from "./team";

export async function hasAccess(userId: string, stripeProductId: string): Promise<boolean> {
    const access = await lib.db.
        select()
        .from(accessTable)
        .where(
            lib.and(
                lib.eq(accessTable.userId, userId),
                lib.eq(accessTable.stripeProductId, stripeProductId),
                lib.isNull(accessTable.refundId),
                lib.isNull(accessTable.deletedAt)
            )
        )
        .orderBy(lib.asc(accessTable.id));

    return access.length > 0;
}

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

export async function refundProduct(paymentIntentId: string, refundId: string): Promise<void> {
    const [{ userId }] = await lib.db.
        update(accessTable)
        .set({ refundId })
        .where(lib.eq(accessTable.paymentIntentId, paymentIntentId))
        .returning({
            userId: accessTable.userId
        })

    const userTeam = await getTeamForUser(userId);

    if (userTeam === null) return;

    await logActivity(userTeam.id, userId, ActivityType.PRODUCT_REFUNDED);
}

export async function cancelRefund(refundId: string): Promise<void> {
    const [{ userId }] = await lib.db.
        update(accessTable)
        .set({ refundId: null })
        .where(lib.eq(accessTable.refundId, refundId))
        .returning({
            userId: accessTable.userId
        })

    const userTeam = await getTeamForUser(userId);

    if (userTeam === null) return;

    await logActivity(userTeam.id, userId, ActivityType.PRODUCT_REFUND_CANCELED);
}