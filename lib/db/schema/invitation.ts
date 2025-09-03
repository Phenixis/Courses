import * as lib from "./library"
import { teamTable } from "./team"
import { userTable } from "./user"

export const invitationTable = lib.pgTable('invitation', {
  id: lib.serial('id').primaryKey(),
  teamId: lib.integer('team_id')
    .notNull()
    .references(() => teamTable.id),
  email: lib.varchar('email', { length: 255 }).notNull(),
  role: lib.varchar('role', { length: 50 }).notNull(),
  invitedBy: lib.text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  invitedAt: lib.timestamp('invited_at').notNull().defaultNow(),
  status: lib.varchar('status', { length: 20 }).notNull().default('pending'),
});

export const invitationRelations = lib.relations(invitationTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [invitationTable.teamId],
    references: [teamTable.id],
  }),
  invitedBy: one(userTable, {
    fields: [invitationTable.invitedBy],
    references: [userTable.id],
  }),
}));

export type Invitation = typeof invitationTable.$inferSelect;
export type NewInvitation = typeof invitationTable.$inferInsert;