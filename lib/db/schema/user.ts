import * as lib from "./library"
import { teamMemberTable } from "./team"
import { invitationTable } from "./invitation"
import { activityLogTable } from "./activity-log"
import { authenticatorTable } from "./authenticator"
import { accountTable } from "./account"
import { sessionTable } from "./session"
import { ticketTable } from "./ticket"


export const userTable = lib.pgTable('user', {
  id: lib.text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: lib.varchar('name', { length: 100 }),
  email: lib.varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: lib.timestamp("emailVerified", { mode: "date" }),
  passwordHash: lib.text('password_hash'),
  role: lib.varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: lib.timestamp('created_at').notNull().defaultNow(),
  updatedAt: lib.timestamp('updated_at').notNull().defaultNow(),
  deletedAt: lib.timestamp('deleted_at'),
  image: lib.text("image"),
});

export const userRelations = lib.relations(userTable, ({ many }) => ({
  teamMembers: many(teamMemberTable),
  invitationsSent: many(invitationTable),
  activityLog: many(activityLogTable),
  authenticator: many(authenticatorTable),
  account: many(accountTable),
  session: many(sessionTable),
  ticket: many(ticketTable),
}));

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;