import { getFilteredFeedbacks, getAllFilteredFeedbacks } from "@/components/feedback/actions";
import { getUser } from "@/lib/db/queries";
import TicketsDisplay from "./ticketsDisplay";

interface FilteredTicketsProps {
    admin?: boolean;
    searchParams: {
        status?: string;
        sortBy?: 'created' | 'updated' | 'status';
        sortOrder?: 'asc' | 'desc';
    };
}

export default async function FilteredTickets({ 
    admin, 
    searchParams 
}: FilteredTicketsProps) {
    const user = await getUser();
    if (!user) {
        return <div>User not found</div>;
    }

    const status = searchParams.status || 'all';
    const sortBy = searchParams.sortBy || 'created';
    const sortOrder = searchParams.sortOrder || 'desc';

    const feedbacks = admin 
        ? await getAllFilteredFeedbacks(status, sortBy, sortOrder)
        : await getFilteredFeedbacks(user?.id || '', user?.email || '', status, sortBy, sortOrder);

    return (
        <TicketsDisplay admin={admin} tickets={feedbacks} />
    );
}