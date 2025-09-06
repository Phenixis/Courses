import * as lib from "./library"

export const chapterTable = lib.pgTable('chapter', {
    id: lib.serial('id').primaryKey(),
    
    stripeProductId: lib.varchar('stripe_product_id', { length: 255 }).notNull(),
    numero: lib.integer('numero').notNull(),
    
    title: lib.varchar('title', { length: 255 }).notNull(),
    content: lib.text('content').notNull(),
    published: lib.boolean('published').notNull().default(false),

    createdAt: lib.timestamp('created_at').notNull().defaultNow(),
    updatedAt: lib.timestamp('updated_at').notNull().defaultNow(),
    deletedAt: lib.timestamp('deleted_at'),
});

export type Chapter = typeof chapterTable.$inferSelect;
export type NewChapter = typeof chapterTable.$inferInsert;