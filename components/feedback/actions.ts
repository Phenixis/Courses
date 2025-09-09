"use server";

import { desc, and, eq, isNull, or, isNotNull, count, asc, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { ticketTable, ticketCommentTable, Ticket, NewTicket, TicketStatus, NewTicketComment } from '@/lib/db/schema';
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
        .orderBy(asc(ticketCommentTable.createdAt));

    return comments;
}

// Add a comment to a ticket
export async function addComment(state: ActionState, data: FormData) {
    const ticketId = parseInt(data.get('ticketId') as string);
    const userId = data.get('userId') as string;
    const comment = data.get('comment') as string;

    if (!comment.trim()) {
        return { error: 'Comment cannot be empty.' };
    }

    const newComment: NewTicketComment = {
        ticketId,
        userId,
        comment: comment.trim(),
    };

    try {
        await db.insert(ticketCommentTable).values(newComment);
        
        // Update ticket's updatedAt timestamp
        await db
            .update(ticketTable)
            .set({ updatedAt: new Date() })
            .where(eq(ticketTable.id, ticketId));

        return { success: 'Comment added successfully.' };
    } catch (error) {
        return { error: 'Failed to add comment. Please try again.' };
    }
}

// Update ticket status (admin only)
export async function updateTicketStatus(state: ActionState, data: FormData) {
    const ticketId = parseInt(data.get('ticketId') as string);
    const status = data.get('status') as string;

    if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
        return { error: 'Invalid status provided.' };
    }

    try {
        const updateData: any = {
            status,
            updatedAt: new Date(),
        };

        // If closing the ticket, set closedAt timestamp
        if (status === TicketStatus.CLOSED) {
            updateData.closedAt = new Date();
        } else if (status !== TicketStatus.CLOSED) {
            // If reopening, clear closedAt
            updateData.closedAt = null;
        }

        await db
            .update(ticketTable)
            .set(updateData)
            .where(eq(ticketTable.id, ticketId));

        return { success: 'Ticket status updated successfully.' };
    } catch (error) {
        return { error: 'Failed to update ticket status. Please try again.' };
    }
}

// Get filtered and sorted tickets
export async function getFilteredFeedbacks(
    userId?: string, 
    userEmail?: string, 
    status?: string,
    sortBy: 'created' | 'updated' | 'status' = 'created',
    sortOrder: 'asc' | 'desc' = 'desc'
) {
    if (!userId && !userEmail) {
        return [] as Ticket[];
    }

    let whereCondition = or(eq(ticketTable.openedBy, userId || ''), eq(ticketTable.openerEmail, userEmail || ''));

    // Apply status filter
    if (status && status !== 'all') {
        whereCondition = and(
            or(eq(ticketTable.openedBy, userId || ''), eq(ticketTable.openerEmail, userEmail || '')),
            eq(ticketTable.status, status)
        );
    }

    // Apply sorting
    const orderByField = sortBy === 'created' ? ticketTable.createdAt :
                        sortBy === 'updated' ? ticketTable.updatedAt :
                        ticketTable.status;
    
    const orderByClause = sortOrder === 'desc' ? desc(orderByField) : asc(orderByField);
    
    const feedbacks: Ticket[] = await db
        .select()
        .from(ticketTable)
        .where(whereCondition)
        .orderBy(orderByClause);
    
    return feedbacks;
}

// Get all filtered and sorted tickets (admin)
export async function getAllFilteredFeedbacks(
    status?: string,
    sortBy: 'created' | 'updated' | 'status' = 'created',
    sortOrder: 'asc' | 'desc' = 'desc'
) {
    let whereCondition = undefined;

    // Apply status filter
    if (status && status !== 'all') {
        whereCondition = eq(ticketTable.status, status);
    }

    // Apply sorting
    const orderByField = sortBy === 'created' ? ticketTable.createdAt :
                        sortBy === 'updated' ? ticketTable.updatedAt :
                        ticketTable.status;
    
    const orderByClause = sortOrder === 'desc' ? desc(orderByField) : asc(orderByField);
    
    let query = db.select().from(ticketTable);
    
    if (whereCondition) {
        query = query.where(whereCondition) as any;
    }
    
    const feedbacks = await query.orderBy(orderByClause);
    
    return feedbacks;
}