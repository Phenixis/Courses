'use client';

import { useState, useOptimistic, startTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import CommentForm from '@/components/ticket/CommentForm';
import AdminControls from '@/components/ticket/AdminControls';
import { formatTicketStatus } from '@/lib/utils';
import { Check, Circle, Loader } from 'lucide-react';

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

export function TicketDetailsDisplay({ initialTicket, ticketOpenerName, ticketOpenerIsAdmin, creationTime }: { initialTicket: Ticket, ticketOpenerName: string, ticketOpenerIsAdmin: boolean, creationTime: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <span>
                        {ticketOpenerName}
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            {creationTime}
                        </span>
                    </span>
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
    )
}

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

    // Local state for optimistic comments
    const [optimisticComments, setOptimisticComments] = useState<OptimisticComment[]>([]);

    const handleStatusUpdate = (newStatus: string) => {
        startTransition(() => {
            setOptimisticStatus(newStatus);
        });
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
        setOptimisticComments(prev => [...prev, optimisticComment]);
    };

    const creationTime = formatDistanceToNow(new Date(initialTicket.createdAt), { addSuffix: true });

    // Merge server comments and optimistic comments, filtering out duplicates
    const mergedComments: OptimisticComment[] = [
        ...initialComments.map(comment => ({ ...comment, isPending: false })),
        ...optimisticComments.filter(
            oc => !initialComments.some(sc => sc.comment === oc.comment && sc.userId === oc.userId && Math.abs(new Date(sc.createdAt).getTime() - new Date(oc.createdAt).getTime()) < 10000)
        )
    ];

    return (
        <section className="relative p-4 lg:p-8">
            <header className="flex justify-between items-center mb-6 z-10 sticky top-0 px-2 py-4 rounded bg-gray-50 dark:bg-gray-900">
                <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100">
                    <span className="text-gray-300 dark:text-gray-700">#{initialTicket.id}</span> {initialTicket.title}
                </h1>
                <Badge variant="secondary" className="gap-1">
                    {
                        optimisticStatus === 'open' ? (<Circle className="size-4" />) :
                            optimisticStatus === 'closed' ? (<Check className="size-4" />) :
                                (<Loader className="size-4" />)
                    }
                    {formatTicketStatus(optimisticStatus)}
                </Badge>
            </header>
            <div className='px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-screen'>
                <article className="col-span-2">
                    <TicketDetailsDisplay initialTicket={initialTicket} ticketOpenerName={ticketOpenerName} ticketOpenerIsAdmin={ticketOpenerIsAdmin} creationTime={creationTime} />
                    {
                        mergedComments.map((comment, index) => {
                            // For optimistic comments, use current user data
                            // For server comments, use commentUsers
                            const commentUser = comment.isPending ? user : (index < commentUsers.length ? commentUsers[index] : null);
                            const commentTime = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
                            const isAdmin = commentUser?.role === 'admin';

                            return (
                                <div key={comment.id}>
                                    <hr className="ml-4 my-6 w-12 rotate-90" />
                                    <TicketDetailsDisplay initialTicket={{ id: comment.id, title: '', description: comment.comment, status: '', createdAt: comment.createdAt }} ticketOpenerName={commentUser?.name || 'Unknown User'} ticketOpenerIsAdmin={isAdmin} creationTime={commentTime} />
                                </div>
                            );
                        })
                    }
                </article>
                <aside className="sticky top-12 h-fit">
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
                </aside>
            </div>
        </section>
    );
}