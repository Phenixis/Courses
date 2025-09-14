"use client"

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import MarkdownViewer from "../ui/markdown-viewer";

export default function ChapterEditor() {
    const [content, setContent] = useState<string>("# New Chapter\n\nStart writing here...");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Placeholder save logic; integrate with API later
            await new Promise((r) => setTimeout(r, 600));
            // You could toast success here
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chapter Content</h2>
                <Button size="sm" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
            <RichTextEditor value={content} onChange={setContent} placeholder="Start writing your chapter..." />
            <div className="text-xs text-muted-foreground flex gap-4">
                <span>Chars: {content.length}</span>
                <span>Words: {content.split(/\s+/).filter(Boolean).length}</span>
            </div>
            <div>
                <h3 className="text-md font-medium mb-2">Preview</h3>
                <MarkdownViewer markdown={content} className="border rounded-md p-4 bg-white dark:bg-gray-800" />
            </div>
        </div>
    );
}