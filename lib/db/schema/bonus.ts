import * as lib from "./library"

export const bonusTable = lib.pgTable('bonus', {
    id: lib.serial('id').primaryKey(),
    
    stripeProductId: lib.varchar('stripe_product_id', { length: 255 }).notNull(),
    
    title: lib.varchar('title', { length: 255 }).notNull(),
    valueInCents: lib.integer('value').notNull().default(0),

    createdAt: lib.timestamp('created_at').notNull().defaultNow(),
    updatedAt: lib.timestamp('updated_at').notNull().defaultNow(),
    deletedAt: lib.timestamp('deleted_at'),
});

export type Bonus = typeof bonusTable.$inferSelect;
export type NewBonus = typeof bonusTable.$inferInsert;