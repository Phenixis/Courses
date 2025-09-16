"use client"

import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Suspense, useEffect, useState } from "react";
// Use client-side markdown renderer for preview to avoid RSC issues
import { ClientMarkdown } from "@/components/ui/markdown-viewer-client";

export default function ChapterEditor() {
    const [content, setContent] = useState<string>("# New Chapter\n\nStart writing here...");
    const [saving, setSaving] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [previewContent, setPreviewContent] = useState<string | null>(null); // snapshot used for preview
    const [showPreview, setShowPreview] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

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

    const handlePreview = async () => {
        // If already showing preview, clicking again refreshes snapshot
        setPreviewLoading(true);
        setShowPreview(true);
        try {
            // Simulate any async transformation if needed (e.g., server processing)
            await new Promise((r) => setTimeout(r, 150));
            setPreviewContent(content); // take snapshot
        } finally {
            setPreviewLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chapter Content</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={saving} onClick={handlePreview}>
                        {previewLoading ? "Loading preview..." : (showPreview ? "Refresh Preview" : "Preview")}
                    </Button>
                    <Button size="sm" disabled={saving || previewing} onClick={handleSave}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
            <RichTextEditor value={content} onChange={setContent} placeholder="Start writing your chapter..." />
            {showPreview && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-md font-medium">Preview</h3>
                        {previewContent && previewContent !== content && (
                            <span className="text-[10px] px-2 py-1 rounded bg-amber-100 text-amber-900 dark:bg-amber-400/10 dark:text-amber-300 border border-amber-200 dark:border-amber-400/30">
                                Preview not up to date with content
                            </span>
                        )}
                    </div>
                    <div className="relative border rounded-md p-4 bg-muted/30 dark:bg-neutral-900 prose prose-sm max-w-none dark:prose-invert min-h-[120px]">
                        {previewLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm text-xs">
                                Generating preview...
                            </div>
                        )}
                        {previewContent && !previewLoading ? (
                            <Suspense fallback={<div className="text-xs">Rendering preview...</div>}>
                                <ClientMarkdown source={previewContent} />
                            </Suspense>
                        ) : null}
                        {!previewContent && !previewLoading && (
                            <div className="text-xs text-muted-foreground">No preview loaded yet.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}