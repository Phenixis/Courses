"use server";

import { desc, and, eq, isNull, or, isNotNull, count } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { ticketTable, ticketCommentTable, Ticket, NewTicket, TicketStatus } from '@/lib/db/schema';
import { ActionState } from '@/lib/auth/middleware';

export async function sendFeedback(state: ActionState, data: FormData) {

    const newTicket: NewTicket = {
        title: data.get('title') as string,
        description: data.get('description') as string,
        openedBy: data.get('userId') as string,
        openerEmail: data.get('email') as string,
        status: TicketStatus.OPEN,
    };

    const result = await db.insert(ticketTable).values(newTicket);

    return { success: 'Feedback sent successfully. You can now find it in the Ticket section, in your settings.' };
}

export async function getFeedbacks(userId?: string, userEmail?: string) {
    if (!userId && !userEmail) {
        return [] as Ticket[];
    }

    const feedbacks: Ticket[] = await db
        .select()
        .from(ticketTable)
        .where(or(eq(ticketTable.openedBy, userId || ''), eq(ticketTable.openerEmail, userEmail || '')))
        .orderBy(desc(ticketTable.createdAt));

    return feedbacks;
}

export async function getAllFeedbacks() {
    const feedbacks = await db
        .select()
        .from(ticketTable)
        .orderBy(desc(ticketTable.createdAt));

    return feedbacks;
}

export async function getTicket(id: number) {
    const feedback = await db
        .select()
        .from(ticketTable)
        .where(eq(ticketTable.id, id));

    return feedback[0];
}

export async function getComments(id: number) {
    const comments = await db
        .select()
        .from(ticketCommentTable)
        .where(eq(ticketCommentTable.ticketId, id))
        .orderBy(desc(ticketCommentTable.createdAt));

    return comments;
}