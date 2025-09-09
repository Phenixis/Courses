'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, ArrowUpDown } from 'lucide-react';
import { TicketStatus } from '@/lib/db/schema';

interface TicketFiltersProps {
    onFilterChange: (filters: {
        status: string;
        sortBy: 'created' | 'updated' | 'status';
        sortOrder: 'asc' | 'desc';
    }) => void;
    currentFilters: {
        status: string;
        sortBy: 'created' | 'updated' | 'status';
        sortOrder: 'asc' | 'desc';
    };
}

export default function TicketFilters({ onFilterChange, currentFilters }: TicketFiltersProps) {
    const handleStatusChange = (status: string) => {
        onFilterChange({
            ...currentFilters,
            status,
        });
    };

    const handleSortByChange = (sortBy: 'created' | 'updated' | 'status') => {
        onFilterChange({
            ...currentFilters,
            sortBy,
        });
    };

    const handleSortOrderToggle = () => {
        onFilterChange({
            ...currentFilters,
            sortOrder: currentFilters.sortOrder === 'desc' ? 'asc' : 'desc',
        });
    };

    const resetFilters = () => {
        onFilterChange({
            status: 'all',
            sortBy: 'created',
            sortOrder: 'desc',
        });
    };

    return (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Filter & Sort:</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Status:</span>
                        <Select
                            value={currentFilters.status}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value={TicketStatus.OPEN}>Open</SelectItem>
                                <SelectItem value={TicketStatus.REVIEWING}>Reviewing</SelectItem>
                                <SelectItem value={TicketStatus.IN_PROGRESS}>In Progress</SelectItem>
                                <SelectItem value={TicketStatus.CLOSED}>Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm">Sort by:</span>
                        <Select
                            value={currentFilters.sortBy}
                            onValueChange={handleSortByChange}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created">Created</SelectItem>
                                <SelectItem value="updated">Updated</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSortOrderToggle}
                        className="gap-2"
                    >
                        <ArrowUpDown className="h-4 w-4" />
                        {currentFilters.sortOrder === 'desc' ? 'Desc' : 'Asc'}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-gray-500"
                    >
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}