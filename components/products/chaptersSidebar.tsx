"use client";

import {
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    Sidebar as SidebarRoot,
    useSidebar
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lock, Menu, PlayCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Public chapter item shape
export interface ChapterItem {
    id: number;
    title: string;
    completed?: boolean;
    locked?: boolean;
}

export interface ChaptersSidebarProps {
    chapters: ChapterItem[];
    title?: string;
    className?: string;
    showTriggerOnMobile?: boolean; // hide if parent supplies its own trigger
}

function ChaptersList({
    chapters,
    title = "Chapters",
}: Pick<
    ChaptersSidebarProps,
    "chapters" | "title"
>) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const chapterIdParam = searchParams.get("chapterId");
    const activeChapterId = chapterIdParam ? parseInt(chapterIdParam, 10) : 0;
    const isMobile = useIsMobile();

    const onSelect = (chapter: ChapterItem) => {
        router.push(`?chapterId=${chapter.id}`);
    };

    return (
        <SidebarContent className="pt-0">
            <SidebarGroup className={`p-2 ${isMobile ? 'my-auto' : ''}`}>
                <SidebarMenu className={`${isMobile ? 'my-auto' : ''}`}>
                    {chapters.length === 0 && (
                        <div className="text-xs text-muted-foreground px-2 py-4">
                            No chapters yet.
                        </div>
                    )}
                    {chapters.map((chapter, idx) => {
                        const isActive = chapter.id === activeChapterId;
                        const Icon = chapter.locked
                            ? Lock
                            : chapter.completed
                                ? CheckCircle2
                                : PlayCircle;
                        return (
                            <SidebarMenuItem key={chapter.id}>
                                <SidebarMenuButton
                                    isActive={isActive}
                                    onClick={() => onSelect?.(chapter)}
                                    aria-current={isActive ? "true" : undefined}
                                    className={cn(
                                        "justify-start",
                                        chapter.locked && "opacity-60 cursor-not-allowed",
                                        !chapter.locked && "cursor-pointer"
                                    )}
                                    disabled={chapter.locked}
                                    tooltip={chapter.title}
                                >
                                    <Icon
                                        className={cn(
                                            "size-4",
                                            isActive && !chapter.locked && "text-primary"
                                        )}
                                    />
                                    <span className="truncate flex-1 text-left">
                                        {idx + 1}. {chapter.title}
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
    );
}

export default function ChaptersSidebar({
    chapters,
    title,
    className,
    showTriggerOnMobile = true,
}: ChaptersSidebarProps) {
    const isMobile = useIsMobile();
    const collapsible = isMobile ? "offcanvas" : ("none" as const);

    function SidebarToggler() {
        const { toggleSidebar } = useSidebar();
        return (
            <>
                {isMobile && showTriggerOnMobile && (
                    <div
                        className="mb-2 flex items-center gap-2 md:hidden"
                        onClick={toggleSidebar}
                    >
                        <Menu />
                        Chapters
                    </div>
                )}
            </>
        );
    }

    return (
        <SidebarProvider defaultOpen>
            <div className={cn("relative", className)}>
                <SidebarToggler />
                <SidebarRoot
                    collapsible={collapsible}
                    className={cn(
                        "border-r md:static md:block md:h-full md:w-64",
                        !isMobile && "w-64"
                    )}
                >
                    <ChaptersList chapters={chapters} title={title} />
                </SidebarRoot>
            </div>
        </SidebarProvider>
    );
}