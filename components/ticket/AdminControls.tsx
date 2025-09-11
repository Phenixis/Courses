'use client';

import { useActionState, startTransition, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Settings } from 'lucide-react';
import { updateTicketStatus } from '@/components/feedback/actions';
import { TicketStatus } from '@/lib/db/schema';
import { formatTicketStatus } from '@/lib/utils';

type ActionState = {
    error?: string;
    success?: string;
};

interface AdminControlsProps {
    ticketId: number;
    currentStatus: string;
    onOptimisticUpdate?: (newStatus: string) => void;
}

export default function AdminControls({ ticketId, currentStatus, onOptimisticUpdate }: AdminControlsProps) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        updateTicketStatus,
        { error: '', success: '' }
    );
    
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [pendingCloseUpdate, setPendingCloseUpdate] = useState(false);

    // Handle optimistic update for close actions only after server success
    useEffect(() => {
        if (state.success && pendingCloseUpdate && onOptimisticUpdate) {
            onOptimisticUpdate(TicketStatus.CLOSED);
            setPendingCloseUpdate(false);
        }
    }, [state.success, pendingCloseUpdate, onOptimisticUpdate]);

    const handleStatusChange = (newStatus: string) => {
        setSelectedStatus(newStatus);
        
        if (newStatus === TicketStatus.CLOSED) {
            setShowCloseDialog(true);
        } else {
            submitStatusChange(newStatus, true); // Immediate optimistic update for non-close actions
        }
    };

    const submitStatusChange = (status: string, immediateOptimisticUpdate: boolean = false) => {
        // Trigger optimistic update immediately only for non-close actions
        if (immediateOptimisticUpdate && onOptimisticUpdate) {
            onOptimisticUpdate(status);
        }
        
        startTransition(() => {
            const formData = new FormData();
            formData.append('ticketId', ticketId.toString());
            formData.append('status', status);
            formAction(formData);
        });
    };

    const handleCloseConfirm = () => {
        // Set flag to trigger optimistic update only after server success
        setPendingCloseUpdate(true);
        submitStatusChange(TicketStatus.CLOSED, false); // No immediate optimistic update
        setShowCloseDialog(false);
    };

    const handleCloseCancel = () => {
        setSelectedStatus(currentStatus);
        setShowCloseDialog(false);
    };

    return (
        <>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Admin Controls
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Change Status:</label>
                        <Select
                            value={selectedStatus}
                            onValueChange={handleStatusChange}
                            disabled={isPending}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TicketStatus.OPEN}>{formatTicketStatus(TicketStatus.OPEN)}</SelectItem>
                                <SelectItem value={TicketStatus.REVIEWING}>{formatTicketStatus(TicketStatus.REVIEWING)}</SelectItem>
                                <SelectItem value={TicketStatus.IN_PROGRESS}>{formatTicketStatus(TicketStatus.IN_PROGRESS)}</SelectItem>
                                <SelectItem value={TicketStatus.CLOSED}>{formatTicketStatus(TicketStatus.CLOSED)}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {state.error && (
                        <p className="text-red-500 text-sm">{state.error}</p>
                    )}
                    {state.success && (
                        <p className="text-green-500 text-sm">{state.success}</p>
                    )}

                    {isPending && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating status...
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Close Ticket
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to close this ticket? This will mark the ticket as resolved and completed.
                            The ticket can still be reopened later if needed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseCancel}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCloseConfirm}
                            disabled={isPending}
                            className="gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Closing...
                                </>
                            ) : (
                                'Close Ticket'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}