'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChapterSidebar, Chapter } from '@/components/ui/chapter-sidebar';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useChapters } from '@/hooks/use-chapters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Save, Plus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CourseEditorProps {
    stripeProductId: string;
    courseName: string;
}

export function CourseEditor({ stripeProductId, courseName }: CourseEditorProps) {
    const {
        chapters,
        loading,
        error,
        selectedChapter,
        createChapter,
        updateChapter,
        selectChapter,
    } = useChapters(stripeProductId);

    const [editingTitle, setEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [tempContent, setTempContent] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    // Update temp values when selected chapter changes
    useEffect(() => {
        if (selectedChapter) {
            setTempTitle(selectedChapter.title);
            setTempContent(selectedChapter.content);
            setIsDirty(false);
        }
    }, [selectedChapter]);

    const handleCreateChapter = useCallback(async () => {
        try {
            const title = `Chapter ${chapters.length + 1}`;
            await createChapter(title);
            toast.success('Chapter created successfully');
        } catch (err) {
            toast.error('Failed to create chapter');
        }
    }, [createChapter, chapters.length]);

    const handleSaveChapter = useCallback(async () => {
        if (!selectedChapter || !isDirty) return;

        try {
            setSaving(true);
            await updateChapter(selectedChapter.id, {
                title: tempTitle.trim() || 'Untitled Chapter',
                content: tempContent,
            });
            setIsDirty(false);
            toast.success('Chapter saved successfully');
        } catch (err) {
            toast.error('Failed to save chapter');
        } finally {
            setSaving(false);
        }
    }, [selectedChapter, tempTitle, tempContent, isDirty, updateChapter]);

    const handleTogglePublished = useCallback(async () => {
        if (!selectedChapter) return;

        try {
            await updateChapter(selectedChapter.id, {
                published: !selectedChapter.published,
            });
            toast.success(`Chapter ${selectedChapter.published ? 'unpublished' : 'published'}`);
        } catch (err) {
            toast.error('Failed to update chapter');
        }
    }, [selectedChapter, updateChapter]);

    const handleTitleChange = (value: string) => {
        setTempTitle(value);
        setIsDirty(true);
    };

    const handleContentChange = (value: string) => {
        setTempContent(value);
        setIsDirty(true);
    };

    const handleSelectChapter = (chapter: Chapter) => {
        selectChapter(chapter);
        setEditingTitle(false);
    };

    if (error) {
        return (
            <div className="flex-1 p-4 lg:p-8">
                <div className="text-center text-red-600">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-0">
            <SidebarProvider defaultOpen={true}>
                <div className="flex h-screen">
                    {/* Chapter Sidebar */}
                    <ChapterSidebar
                        chapters={chapters}
                        selectedChapterId={selectedChapter?.id || null}
                        onSelectChapter={handleSelectChapter}
                        onCreateChapter={handleCreateChapter}
                        className="border-r"
                    />

                    {/* Main Content */}
                    <SidebarInset className="flex-1">
                        <div className="flex-1 flex flex-col h-full">
                            {/* Header */}
                            <header className="border-b bg-background px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-foreground">
                                            {courseName}
                                        </h1>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Course Editor
                                        </p>
                                    </div>
                                    {selectedChapter && (
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={handleTogglePublished}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center space-x-2"
                                            >
                                                {selectedChapter.published ? (
                                                    <>
                                                        <EyeOff className="h-4 w-4" />
                                                        <span>Unpublish</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="h-4 w-4" />
                                                        <span>Publish</span>
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={handleSaveChapter}
                                                disabled={!isDirty || saving}
                                                size="sm"
                                                className="flex items-center space-x-2"
                                            >
                                                <Save className="h-4 w-4" />
                                                <span>{saving ? 'Saving...' : 'Save'}</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </header>

                            {/* Content Area */}
                            <div className="flex-1 p-6 overflow-hidden">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                            <p className="text-muted-foreground">Loading chapters...</p>
                                        </div>
                                    </div>
                                ) : selectedChapter ? (
                                    <div className="h-full flex flex-col space-y-6">
                                        {/* Chapter Title */}
                                        <div className="space-y-2">
                                            <Label htmlFor="chapter-title">Chapter Title</Label>
                                            <Input
                                                id="chapter-title"
                                                value={tempTitle}
                                                onChange={(e) => handleTitleChange(e.target.value)}
                                                placeholder="Enter chapter title..."
                                                className="text-lg font-medium"
                                            />
                                        </div>

                                        {/* Chapter Content */}
                                        <div className="flex-1 flex flex-col space-y-2">
                                            <Label htmlFor="chapter-content">Chapter Content</Label>
                                            <div className="flex-1 min-h-0">
                                                <RichTextEditor
                                                    content={tempContent}
                                                    onChange={handleContentChange}
                                                    placeholder="Start writing your chapter content..."
                                                    className="h-full"
                                                />
                                            </div>
                                        </div>

                                        {/* Dirty State Indicator */}
                                        {isDirty && (
                                            <div className="text-sm text-amber-600 dark:text-amber-400">
                                                You have unsaved changes
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center space-y-4">
                                            <div className="text-6xl text-muted-foreground/30">📝</div>
                                            <div>
                                                <h3 className="text-lg font-medium">No chapter selected</h3>
                                                <p className="text-muted-foreground">
                                                    Select a chapter from the sidebar to start editing, or create a new one.
                                                </p>
                                            </div>
                                            <Button onClick={handleCreateChapter} className="mt-4">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create First Chapter
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}