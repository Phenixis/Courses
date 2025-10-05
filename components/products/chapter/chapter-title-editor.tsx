"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type ChapterTitleEditorProps = {
    title: string;
    onTitleChange: (value: string) => void;
    disabled?: boolean;
    error?: string | null;
    statusMessage?: string | null;
    className?: string;
};

export const ChapterTitleEditor = forwardRef<HTMLInputElement, ChapterTitleEditorProps>(
    ({ title, onTitleChange, disabled, error, statusMessage, className }, ref) => {
        return (
            <div className={cn("flex flex-col gap-2", className)}>
                <Label htmlFor="chapter-title" className="text-sm font-medium">
                    Chapter title
                </Label>
                <Input
                    id="chapter-title"
                    ref={ref}
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    disabled={disabled}
                />
                {error && (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
                {statusMessage && !error && (
                    <p className="text-sm text-muted-foreground" role="status">
                        {statusMessage}
                    </p>
                )}
            </div>
        );
    },
);

ChapterTitleEditor.displayName = "ChapterTitleEditor";
