import * as lib from "./library"
import { userTable } from "./user"

export const sessionTable = lib.pgTable("session", {
  sessionToken: lib.text("sessionToken").primaryKey(),
  userId: lib.text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expires: lib.timestamp("expires", { mode: "date" }).notNull(),
})

export const sessionRelations = lib.relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));