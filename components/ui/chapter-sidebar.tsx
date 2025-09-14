'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Plus, FileText, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Chapter {
    id: number;
    stripeProductId: string;
    numero: number;
    title: string;
    content: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}

interface ChapterSidebarProps {
    chapters: Chapter[];
    selectedChapterId: number | null;
    onSelectChapter: (chapter: Chapter) => void;
    onCreateChapter: () => void;
    className?: string;
}

const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
    chapters,
    selectedChapterId,
    onSelectChapter,
    onCreateChapter,
    className,
}) => {
    const sortedChapters = chapters.sort((a, b) => a.numero - b.numero);

    return (
        <Sidebar className={cn('w-80', className)}>
            <SidebarHeader>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Chapters</h2>
                    <Button
                        onClick={onCreateChapter}
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        title="Add new chapter"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarHeader>
            
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Course Content</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sortedChapters.map((chapter) => (
                                <SidebarMenuItem key={chapter.id}>
                                    <SidebarMenuButton
                                        onClick={() => onSelectChapter(chapter)}
                                        isActive={selectedChapterId === chapter.id}
                                        className="flex items-center justify-between w-full p-3 group"
                                    >
                                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        #{chapter.numero}
                                                    </span>
                                                    <div className="flex-shrink-0">
                                                        {chapter.published ? (
                                                            <Eye className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <EyeOff className="h-3 w-3 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium truncate mt-0.5">
                                                    {chapter.title || 'Untitled Chapter'}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {chapter.content 
                                                        ? chapter.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                                                        : 'No content yet...'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            
                            {sortedChapters.length === 0 && (
                                <SidebarMenuItem>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No chapters yet</p>
                                        <p className="text-xs">Click the + button to add your first chapter</p>
                                    </div>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export { ChapterSidebar };