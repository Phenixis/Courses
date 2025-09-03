import * as lib from "./library"
import { ticketTable } from "./ticket"
import { userTable } from "./user"

export const ticketCommentTable = lib.pgTable('ticket_comment', {
  id: lib.serial('id').primaryKey(),
  ticketId: lib.integer('ticket_id')
    .notNull()
    .references(() => ticketTable.id, { onDelete: "cascade" }),
  userId: lib.text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  comment: lib.text('comment').notNull(),
  createdAt: lib.timestamp('created_at').notNull().defaultNow(),
});

export const ticketCommentRelations = lib.relations(ticketCommentTable, ({ one }) => ({
  ticket: one(ticketTable, {
    fields: [ticketCommentTable.ticketId],
    references: [ticketTable.id],
  }),
  user: one(userTable, {
    fields: [ticketCommentTable.userId],
    references: [userTable.id],
  }),
}));

export type TicketComment = typeof ticketCommentTable.$inferSelect;
export type NewTicketComment = typeof ticketCommentTable.$inferInsert;