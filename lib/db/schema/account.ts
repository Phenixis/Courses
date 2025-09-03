import * as lib from "./library"
import { userTable } from "./user"

export const accountTable = lib.pgTable(
  "account",
  {
    userId: lib.text("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    type: lib.text("type").$type<lib.AdapterAccountType>().notNull(),
    provider: lib.text("provider").notNull(),
    providerAccountId: lib.text("providerAccountId").notNull(),
    refresh_token: lib.text("refresh_token"),
    access_token: lib.text("access_token"),
    expires_at: lib.integer("expires_at"),
    token_type: lib.text("token_type"),
    scope: lib.text("scope"),
    id_token: lib.text("id_token"),
    session_state: lib.text("session_state"),
  },
  (account) => [
    {
      compoundKey: lib.primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)

export const accountRelations = lib.relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));