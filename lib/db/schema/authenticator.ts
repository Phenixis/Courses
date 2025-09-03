import * as lib from "./library"
import { userTable } from "./user"

export const authenticatorTable = lib.pgTable(
  "authenticator",
  {
    credentialID: lib.text("credentialID").notNull().unique(),
    userId: lib.text("userId")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    providerAccountId: lib.text("providerAccountId").notNull(),
    credentialPublicKey: lib.text("credentialPublicKey").notNull(),
    counter: lib.integer("counter").notNull(),
    credentialDeviceType: lib.text("credentialDeviceType").notNull(),
    credentialBackedUp: lib.boolean("credentialBackedUp").notNull(),
    transports: lib.text("transports"),
  },
  (authenticator) => [
    {
      compositePK: lib.primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)

export const authenticatorRelations = lib.relations(authenticatorTable, ({ one }) => ({
  user: one(userTable, {
    fields: [authenticatorTable.userId],
    references: [userTable.id],
  }),
}));