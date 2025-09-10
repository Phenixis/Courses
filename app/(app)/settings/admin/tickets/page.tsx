import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import FilteredTickets from '@/components/big/filteredTickets';
import TicketsDisplay from '@/components/big/ticketsDisplay';
import TicketFilters from '@/components/ticket/TicketFilters';

export const metadata: Metadata = {
    title: 'Tickets',
};

interface PageProps {
    searchParams: Promise<{
        status?: string;
        sortBy?: 'created' | 'updated' | 'status';
        sortOrder?: 'asc' | 'desc';
    }>;
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    
    return (
        <section className="flex-1 p-4 lg:p-8">
            <h1 className="text-lg lg:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6">
                Tickets
            </h1>
            <Card>
                <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <CardTitle>Recent Tickets</CardTitle>
                        <TicketFilters />
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<TicketsDisplay />}>
                        <FilteredTickets admin searchParams={params} />
                    </Suspense>
                </CardContent>
            </Card>
        </section>
    )
}