'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, ArrowUpDown } from 'lucide-react';
import { TicketStatus } from '@/lib/db/schema';
import { formatTicketStatus } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

interface TicketFiltersProps {
    className?: string;
}

export default function TicketFilters({ className }: TicketFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const currentStatus = searchParams.get('status') || 'all';
    const currentSortBy = (searchParams.get('sortBy') as 'created' | 'updated' | 'status') || 'created';
    const currentSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const updateURL = useCallback((params: { status?: string; sortBy?: string; sortOrder?: string }) => {
        // Clear existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new debounced timer
        debounceTimerRef.current = setTimeout(() => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            
            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    newSearchParams.set(key, value);
                } else if (key === 'status' && value === 'all') {
                    newSearchParams.delete(key);
                } else if (value) {
                    newSearchParams.set(key, value);
                }
            });

            const newURL = `${window.location.pathname}?${newSearchParams.toString()}`;
            router.push(newURL);
        }, 300); // 300ms debounce
    }, [router, searchParams]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleStatusChange = (status: string) => {
        updateURL({ status });
    };

    const handleSortByChange = (sortBy: 'created' | 'updated' | 'status') => {
        updateURL({ sortBy });
    };

    const handleSortOrderToggle = () => {
        const newSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
        updateURL({ sortOrder: newSortOrder });
    };

    const resetFilters = () => {
        router.push(window.location.pathname);
    };

    return (
        <div className={`flex flex-wrap items-center gap-3 ${className || ''}`}>
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter & Sort:</span>
            </div>
            
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <Select
                    value={currentStatus}
                    onValueChange={handleStatusChange}
                >
                    <SelectTrigger className="w-28 h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value={TicketStatus.OPEN}>{formatTicketStatus(TicketStatus.OPEN)}</SelectItem>
                        <SelectItem value={TicketStatus.REVIEWING}>{formatTicketStatus(TicketStatus.REVIEWING)}</SelectItem>
                        <SelectItem value={TicketStatus.IN_PROGRESS}>{formatTicketStatus(TicketStatus.IN_PROGRESS)}</SelectItem>
                        <SelectItem value={TicketStatus.CLOSED}>{formatTicketStatus(TicketStatus.CLOSED)}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
                <Select
                    value={currentSortBy}
                    onValueChange={handleSortByChange}
                >
                    <SelectTrigger className="w-24 h-8">
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
                className="gap-1 h-8 px-2"
            >
                <ArrowUpDown className="h-3 w-3" />
                <span className="text-xs">{currentSortOrder === 'desc' ? 'Desc' : 'Asc'}</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-500 h-8 px-2 text-xs"
            >
                Reset
            </Button>
        </div>
    );
}