'use client';

import { useState, useOptimistic } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import CommentForm from '@/components/ticket/CommentForm';
import AdminControls from '@/components/ticket/AdminControls';
import { formatTicketStatus } from '@/lib/utils';

interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
}

interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: Date;
    openedBy?: string | null;
    openerEmail?: string | null;
}

interface Comment {
    id: number;
    ticketId: number;
    userId: string;
    comment: string;
    createdAt: Date;
}

interface TicketDetailsProps {
    initialTicket: Ticket;
    user: User;
    initialComments: Comment[];
    commentUsers: (User | null)[];
    ticketOpenerName: string;
    ticketOpenerIsAdmin: boolean;
}

type OptimisticComment = Comment & { isPending?: boolean };

export default function TicketDetails({ 
    initialTicket, 
    user, 
    initialComments, 
    commentUsers, 
    ticketOpenerName, 
    ticketOpenerIsAdmin 
}: TicketDetailsProps) {
    // Optimistic state for ticket status
    const [optimisticStatus, setOptimisticStatus] = useOptimistic(
        initialTicket.status,
        (currentStatus: string, newStatus: string) => newStatus
    );

    // Optimistic state for comments
    const [optimisticComments, addOptimisticComment] = useOptimistic(
        initialComments.map(comment => ({ ...comment, isPending: false })) as OptimisticComment[],
        (currentComments: OptimisticComment[], newComment: OptimisticComment) => [
            ...currentComments,
            { ...newComment, isPending: true }
        ]
    );

    const handleStatusUpdate = (newStatus: string) => {
        setOptimisticStatus(newStatus);
    };

    const handleCommentAdd = (comment: string) => {
        const optimisticComment: OptimisticComment = {
            id: Date.now(), // Temporary ID
            ticketId: initialTicket.id,
            userId: user.id,
            comment,
            createdAt: new Date(),
            isPending: true
        };
        addOptimisticComment(optimisticComment);
    };

    const creationTime = formatDistanceToNow(new Date(initialTicket.createdAt), { addSuffix: true });

    return (
        <section className="flex-1 p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100">
                    <span className="text-gray-300 dark:text-gray-700">#{initialTicket.id}</span> {initialTicket.title}
                </h1>
                <Badge variant="outline">{formatTicketStatus(optimisticStatus)}</Badge>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span>{ticketOpenerName} wrote {creationTime}:</span>
                        {ticketOpenerIsAdmin && (
                            <Badge variant="secondary" className="text-xs">
                                Admin
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>
                        {initialTicket.description}
                    </p>
                </CardContent>
            </Card>
            {
                optimisticComments.map((comment, index) => {
                    // For existing comments, use the original user data
                    // For optimistic comments, use current user data
                    const commentUser = comment.isPending ? user : (index < commentUsers.length ? commentUsers[index] : null);
                    const commentTime = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
                    const isAdmin = commentUser?.role === 'admin';
                    
                    return (
                        <div key={comment.id}>
                            <hr className="ml-4 my-6 w-12 rotate-90" />
                            <Card className={`mt-4 ${comment.isPending ? 'opacity-70' : ''}`}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span>
                                            {commentUser?.name || 'Unknown User'} wrote {commentTime}:
                                            {comment.isPending && (
                                                <span className="text-xs text-gray-500 ml-2">(sending...)</span>
                                            )}
                                        </span>
                                        {isAdmin && (
                                            <Badge variant="secondary" className="text-xs">
                                                Admin
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>
                                        {comment.comment}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })
            }
            
            <CommentForm 
                ticketId={initialTicket.id} 
                userId={user.id} 
                onOptimisticAdd={handleCommentAdd}
            />
            
            {user.role === 'admin' && (
                <AdminControls 
                    ticketId={initialTicket.id} 
                    currentStatus={optimisticStatus}
                    onOptimisticUpdate={handleStatusUpdate}
                />
            )}
        </section>
    );
}