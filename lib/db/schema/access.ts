import * as lib from "./library"
import { userTable } from "./user";

export const accessTable = lib.pgTable('access', {
    id: lib.serial('id').primaryKey(),

    userId: lib.text("user_id").notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    stripeProductId: lib.varchar('stripe_product_id', { length: 255 }).notNull(),

    stripeCustomerId: lib.text('stripe_customer_id').notNull(),
    stripePriceId: lib.varchar('stripe_price_id', { length: 255 }).notNull(),
    paymentIntentId: lib.varchar('payment_intent_id', { length: 255 }).notNull(),

    refundId: lib.varchar('refund_id', { length: 255 }),

    createdAt: lib.timestamp('created_at').notNull().defaultNow(),
    updatedAt: lib.timestamp('updated_at').notNull().defaultNow(),
    deletedAt: lib.timestamp('deleted_at'),
});

export type Access = typeof accessTable.$inferSelect;
export type NewAccess = typeof accessTable.$inferInsert;