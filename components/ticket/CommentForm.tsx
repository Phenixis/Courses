'use client';

import { useActionState, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { addComment } from '@/components/feedback/actions';

type ActionState = {
    error?: string;
    success?: string;
};

interface CommentFormProps {
    ticketId: number;
    userId: string;
}

export default function CommentForm({ ticketId, userId }: CommentFormProps) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        addComment,
        { error: '', success: '' }
    );

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        startTransition(() => {
            const formData = new FormData(event.currentTarget);
            formAction(formData);
        });
        
        // Clear the form on successful submission
        if (!state.error) {
            (event.target as HTMLFormElement).reset();
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="hidden" name="ticketId" value={ticketId} />
                    <input type="hidden" name="userId" value={userId} />
                    
                    <div>
                        <Textarea
                            name="comment"
                            placeholder="Write your comment here..."
                            required
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {state.error && (
                        <p className="text-red-500 text-sm">{state.error}</p>
                    )}
                    {state.success && (
                        <p className="text-green-500 text-sm">{state.success}</p>
                    )}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding comment...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Add Comment
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}