'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Filter, ArrowUpDown } from 'lucide-react';
import { TicketStatus } from '@/lib/db/schema';
import { formatTicketStatus } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';

interface TicketFiltersProps {
    className?: string;
}

export default function TicketFilters({ className }: TicketFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Multi-status selection: status param is a comma-separated list
    const statusParam = searchParams.get('status');
    const allStatuses = [
        TicketStatus.OPEN,
        TicketStatus.REVIEWING,
        TicketStatus.IN_PROGRESS,
        TicketStatus.CLOSED,
    ];
    // Default: all except CLOSED
    const defaultStatuses = [
        TicketStatus.OPEN,
        TicketStatus.REVIEWING,
        TicketStatus.IN_PROGRESS,
    ];
    // Local state for selected statuses
    const [selectedStatuses, setSelectedStatuses] = React.useState<TicketStatus[]>(
        statusParam
            ? statusParam.split(',').filter((s): s is TicketStatus => allStatuses.includes(s as TicketStatus)) as TicketStatus[]
            : defaultStatuses
    );
    // Sync local state with URL changes
    React.useEffect(() => {
        const statusParam = searchParams.get('status');
        setSelectedStatuses(
            statusParam
                ? statusParam.split(',').filter((s): s is TicketStatus => allStatuses.includes(s as TicketStatus)) as TicketStatus[]
                : defaultStatuses
        );
    }, [searchParams]);
    const currentSortBy = (searchParams.get('sortBy') as 'created' | 'updated' | 'status') || 'created';
    const currentSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const updateURL = useCallback((params: { status?: TicketStatus[]; sortBy?: string; sortOrder?: string }) => {
        // Clear existing debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new debounced timer
        debounceTimerRef.current = setTimeout(() => {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            Object.entries(params).forEach(([key, value]) => {
                if (key === 'status') {
                    if (Array.isArray(value) && value.length > 0 && value.length < allStatuses.length) {
                        // Use join with ',' and set directly, then replace encoded %2C with ','
                        newSearchParams.set('status', value.join(','));
                    } else {
                        newSearchParams.delete('status');
                    }
                } else if (typeof value === 'string') {
                    newSearchParams.set(key, value);
                }
            });
            let queryString = newSearchParams.toString();
            // Replace all encoded commas with actual commas for status param
            queryString = queryString.replace(/status=([^&]*)/g, (match, p1) => {
                return `status=${decodeURIComponent(p1)}`;
            });
            const newURL = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
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

    // Multi-status change handler
    const handleStatusChange = (status: TicketStatus, checked: boolean) => {
        let newStatuses: TicketStatus[];
        if (checked) {
            newStatuses = Array.from(new Set([...selectedStatuses, status]));
        } else {
            newStatuses = selectedStatuses.filter((s) => s !== status);
        }
        setSelectedStatuses(newStatuses); // Update local state immediately
        updateURL({ status: newStatuses });
    };

    const handleSortByChange = (sortBy: 'created' | 'updated' | 'status') => {
        updateURL({ sortBy });
    };

    const handleSortOrderToggle = () => {
        const newSortOrder = currentSortOrder === 'desc' ? 'asc' : 'desc';
        updateURL({ sortOrder: newSortOrder });
    };

    const resetFilters = () => {
        // Explicitly reset to default statuses and default sort
        updateURL({
            status: defaultStatuses,
            sortBy: 'created',
            sortOrder: 'desc',
        });
    };

    return (
        <div className={`flex flex-wrap items-center gap-3 ${className || ''}`}>
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter & Sort:</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-8 flex justify-between items-center px-2 text-xs">
                            <span>
                                {
                                    selectedStatuses.length === 0
                                        ? 'None'
                                        : selectedStatuses.length === allStatuses.length
                                            ? 'All'
                                            : selectedStatuses.length === 1
                                                ? formatTicketStatus(selectedStatuses[0])
                                                : `${selectedStatuses.length} selected`
                                }
                            </span>
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                        <div className="flex flex-col gap-2">
                            {allStatuses.map((status) => (
                                <label key={status} className="flex items-center gap-2 text-xs cursor-pointer">
                                    <Checkbox
                                        checked={selectedStatuses.includes(status)}
                                        onCheckedChange={(checked) => handleStatusChange(status, !!checked)}
                                        className="h-4 w-4"
                                    />
                                    {formatTicketStatus(status)}
                                </label>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
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