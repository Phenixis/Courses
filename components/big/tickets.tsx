import { getFeedbacks, getAllFeedbacks } from "@/components/feedback/actions";
import { getUser } from "@/lib/db/queries";
import TicketsWithFilters from "./ticketsWithFilters";

export default async function Tickets({
    admin
} : {
    admin?: boolean
}) {
    const user = await getUser();
    if (!user) {
        return <div>User not found</div>;
    }

    const initialTickets = admin ? await getAllFeedbacks() : await getFeedbacks(user?.id || '', user?.email || '');

    return (
        <TicketsWithFilters
            initialTickets={initialTickets}
            admin={admin}
        />
    )
}