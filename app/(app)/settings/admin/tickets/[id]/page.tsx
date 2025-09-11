import { getTicket, getComments } from "@/components/feedback/actions";
import { getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from 'date-fns';
import TicketDetails from '@/components/ticket/TicketDetails';

export default async function Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;
    const ticket = await getTicket(parseInt(id));
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
    let ticketOpenerIsAdmin = false;
    if (ticket.openedBy) {
        const ticketOpener = await getUser(ticket.openedBy);
        ticketOpenerName = ticketOpener?.name || 'Unknown User';
        ticketOpenerIsAdmin = ticketOpener?.role === 'admin';
    }

    // Get comment users in parallel
    const commentUsers = await Promise.all(
        comments.map(comment => getUser(comment.userId))
    );

    return (
        <TicketDetails
            initialTicket={ticket}
            user={user}
            initialComments={comments}
            commentUsers={commentUsers}
            ticketOpenerName={ticketOpenerName}
            ticketOpenerIsAdmin={ticketOpenerIsAdmin}
        />
    )
}