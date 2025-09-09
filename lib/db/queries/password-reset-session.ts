import * as lib from "./library"
import { passwordResetSessionTable, type NewPasswordResetSession } from "../schema/password-reset-session"

export async function createPasswordResetSession(
    session: NewPasswordResetSession
) {
    const [createdSession] = await lib.db
        .insert(passwordResetSessionTable)
        .values(session)
        .returning();

    return createdSession;
}

export async function getPasswordResetSession(sessionId: string) {
    const [session] = await lib.db
        .select()
        .from(passwordResetSessionTable)
        .where(
            lib.and(
                lib.eq(passwordResetSessionTable.sessionId, sessionId),
                lib.isNull(passwordResetSessionTable.usedAt),
                lib.gt(passwordResetSessionTable.expiresAt, new Date())
            )
        )
        .limit(1);

    return session || null;
}

export async function markPasswordResetSessionAsUsed(sessionId: string) {
    const [updatedSession] = await lib.db
        .update(passwordResetSessionTable)
        .set({ usedAt: new Date() })
        .where(lib.eq(passwordResetSessionTable.sessionId, sessionId))
        .returning();

    return updatedSession;
}

export async function cleanupExpiredPasswordResetSessions() {
    await lib.db
        .delete(passwordResetSessionTable)
        .where(lib.lt(passwordResetSessionTable.expiresAt, new Date()));
}

export async function deletePasswordResetSessionsForUser(userId: string) {
    await lib.db
        .delete(passwordResetSessionTable)
        .where(lib.eq(passwordResetSessionTable.userId, userId));
}