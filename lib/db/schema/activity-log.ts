import * as lib from "./library"
import { userTable } from "./user"
import { teamTable } from "./team"

export const activityLogTable = lib.pgTable('activity_log', {
  id: lib.serial('id').primaryKey(),
  teamId: lib.integer('team_id')
    .notNull()
    .references(() => teamTable.id),
  userId: lib.text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  action: lib.text('action').notNull(),
  timestamp: lib.timestamp('timestamp').notNull().defaultNow(),
  ipAddress: lib.varchar('ip_address', { length: 45 }),
});

export const activityLogRelations = lib.relations(activityLogTable, ({ one }) => ({
  team: one(teamTable, {
    fields: [activityLogTable.teamId],
    references: [teamTable.id],
  }),
  user: one(userTable, {
    fields: [activityLogTable.userId],
    references: [userTable.id],
  }),
}));

export type ActivityLog = typeof activityLogTable.$inferSelect;
export type NewActivityLog = typeof activityLogTable.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}