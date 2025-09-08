import * as lib from "./library"
import { userTable } from "./user"

export const passwordResetSessionTable = lib.pgTable("password_reset_session", {
    id: lib.text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: lib.text("userId")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
    sessionId: lib.text("sessionId")
        .notNull()
        .unique()
        .$defaultFn(() => crypto.randomUUID()),
    email: lib.varchar("email", { length: 255 }).notNull(),
    expiresAt: lib.timestamp("expiresAt", { mode: "date" }).notNull(),
    usedAt: lib.timestamp("usedAt", { mode: "date" }),
    createdAt: lib.timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const passwordResetSessionRelations = lib.relations(passwordResetSessionTable, ({ one }) => ({
    user: one(userTable, {
        fields: [passwordResetSessionTable.userId],
        references: [userTable.id],
    }),
}));

export type PasswordResetSession = typeof passwordResetSessionTable.$inferSelect;
export type NewPasswordResetSession = typeof passwordResetSessionTable.$inferInsert;