'use client';

import { useState } from 'react';
import TicketsDisplay from './ticketsDisplay';
import TicketFilters from '../ticket/TicketFilters';
import { Ticket } from '@/lib/db/schema';

interface TicketsWithFiltersProps {
    initialTickets: Ticket[];
    admin?: boolean;
}

export default function TicketsWithFilters({ 
    initialTickets, 
    admin
}: TicketsWithFiltersProps) {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [filters, setFilters] = useState({
        status: 'all',
        sortBy: 'created' as 'created' | 'updated' | 'status',
        sortOrder: 'desc' as 'asc' | 'desc',
    });

    const handleFilterChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
        
        // Client-side filtering and sorting
        let filtered = [...initialTickets];
        
        // Filter by status
        if (newFilters.status !== 'all') {
            filtered = filtered.filter(ticket => ticket.status === newFilters.status);
        }
        
        // Sort
        filtered.sort((a, b) => {
            let valueA: any, valueB: any;
            
            switch (newFilters.sortBy) {
                case 'created':
                    valueA = new Date(a.createdAt);
                    valueB = new Date(b.createdAt);
                    break;
                case 'updated':
                    valueA = new Date(a.updatedAt);
                    valueB = new Date(b.updatedAt);
                    break;
                case 'status':
                    valueA = a.status;
                    valueB = b.status;
                    break;
                default:
                    return 0;
            }
            
            if (newFilters.sortOrder === 'desc') {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            } else {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            }
        });
        
        setTickets(filtered);
    };

    return (
        <div>
            <TicketFilters />
            <TicketsDisplay 
                admin={admin} 
                tickets={tickets} 
            />
        </div>
    );
}