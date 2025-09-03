import * as lib from "./library"
import { activityLogTable } from "./activity-log"
import { invitationTable } from "./invitation"
import { User, userTable } from "./user"

/* Team Table */
export const teamTable = lib.pgTable('team', {
  id: lib.serial('id').primaryKey(),
  name: lib.varchar('name', { length: 100 }).notNull(),
  createdAt: lib.timestamp('created_at').notNull().defaultNow(),
  updatedAt: lib.timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: lib.text('stripe_customer_id').unique(),
  stripeSubscriptionId: lib.text('stripe_subscription_id').unique(),
  stripeProductId: lib.text('stripe_product_id'),
  planName: lib.varchar('plan_name', { length: 50 }),
  subscriptionStatus: lib.varchar('subscription_status', { length: 20 }),
});

/* Team table/User table relation */ 
export const teamMemberTable = lib.pgTable('team_member', {
  id: lib.serial('id').primaryKey(),
  userId: lib.text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  teamId: lib.integer('team_id')
    .notNull()
    .references(() => teamTable.id),
  role: lib.varchar('role', { length: 50 }).notNull(),
  joinedAt: lib.timestamp('joined_at').notNull().defaultNow(),
});

 /* Team relations */
export const teamRelations = lib.relations(teamTable, ({ many }) => ({
  teamMembers: many(teamMemberTable),
  activityLog: many(activityLogTable),
  invitation: many(invitationTable),
}));

/* Team Member relations */
export const teamMemberRelations = lib.relations(teamMemberTable, ({ one }) => ({
  user: one(userTable, {
    fields: [teamMemberTable.userId],
    references: [userTable.id],
  }),
  team: one(teamTable, {
    fields: [teamMemberTable.teamId],
    references: [teamTable.id],
  }),
}));

/* Team type definitions */
export type Team = typeof teamTable.$inferSelect;
export type NewTeam = typeof teamTable.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  })[];
};

/* Team Member type definitions */
export type TeamMember = typeof teamMemberTable.$inferSelect;
export type NewTeamMember = typeof teamMemberTable.$inferInsert;