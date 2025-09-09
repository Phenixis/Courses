import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTicket, getComments } from "@/components/feedback/actions";
import { getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import CommentForm from '@/components/ticket/CommentForm';
import AdminControls from '@/components/ticket/AdminControls';

export default async function Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;
    const ticket = await getTicket(parseInt(id));
    const creationTime = formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true });
    const user = await getUser();
    const comments = await getComments(parseInt(id));

    if (!user) {
        redirect('/login');
    }

    if ((ticket.openedBy !== user.id && ticket.openerEmail !== user.email) && user.role !== 'admin') {
        redirect('/settings/tickets');
    }

    // Get user name for the ticket opener
    let ticketOpenerName = 'Guest';
    if (ticket.openedBy) {
        const ticketOpener = await getUser(ticket.openedBy);
        ticketOpenerName = ticketOpener?.name || 'Unknown User';
    }

    // Get comment users in parallel
    const commentUsers = await Promise.all(
        comments.map(comment => getUser(comment.userId))
    );

    return (
        <section className="flex-1 p-4 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100">
                    <span className="text-gray-300 dark:text-gray-700">#{ticket.id}</span> {ticket.title}
                </h1>
                <Badge variant="outline">{ticket.status}</Badge>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{ticketOpenerName} wrote {creationTime}:</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>
                        {ticket.description}
                    </p>
                </CardContent>
            </Card>
            {
                comments.map((comment, index) => {
                    const commentUser = commentUsers[index];
                    const commentTime = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
                    
                    return (
                        <div key={comment.id}>
                            <hr className="ml-4 my-6 w-12 rotate-90" />
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle>{commentUser?.name || 'Unknown User'} wrote {commentTime}:</CardTitle>
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
            
            <CommentForm ticketId={parseInt(id)} userId={user.id} />
            
            {user.role === 'admin' && (
                <AdminControls ticketId={parseInt(id)} currentStatus={ticket.status} />
            )}
        </section>
    )
}