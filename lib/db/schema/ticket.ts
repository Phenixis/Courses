import * as lib from "./library"
import { userTable } from "./user"
import { ticketCommentTable } from "./ticket-comment"

export const ticketTable = lib.pgTable('ticket', {
  id: lib.serial('id').primaryKey(),
  openedBy: lib.text("userId")
    .references(() => userTable.id, { onDelete: "cascade" }),
  openerEmail: lib.varchar('opener_email', { length: 255 }),
  title: lib.varchar('title', { length: 255 }).notNull(),
  description: lib.text('description').notNull(),
  status: lib.varchar('status', { length: 20 }).notNull().default('open'),
  createdAt: lib.timestamp('created_at').notNull().defaultNow(),
  updatedAt: lib.timestamp('updated_at').notNull().defaultNow(),
  closedAt: lib.timestamp('closed_at'),
});

export const ticketRelations = lib.relations(ticketTable, ({ many }) => ({
  comment: many(ticketCommentTable),
}));

export type Ticket = typeof ticketTable.$inferSelect;
export type NewTicket = typeof ticketTable.$inferInsert;

export enum TicketStatus {
  OPEN = 'open',
  REVIEWING = 'reviewing',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}