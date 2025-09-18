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
import { Chapter } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { CheckCircle2, Lock, Menu, PlayCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";

export interface ChaptersSidebarProps {
    chapters: Chapter[];
    title?: string;
    className?: string;
    showTriggerOnMobile?: boolean; // hide if parent supplies its own trigger
    children?: React.ReactNode;
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
    const pathname = usePathname();
    const chapterIdParam = searchParams.get("chapterId");
    const activeChapterId = chapterIdParam ? parseInt(chapterIdParam, 10) : 0;
    const isMobile = useIsMobile();

    const onSelect = (chapter: Chapter) => {
        router.push(`${pathname}/${chapter.numero}`);
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
                        return (
                            <SidebarMenuItem key={chapter.id}>
                                <SidebarMenuButton
                                    isActive={isActive}
                                    onClick={() => onSelect?.(chapter)}
                                    aria-current={isActive ? "true" : undefined}
                                    className={cn(
                                        "justify-start"
                                    )}
                                    tooltip={chapter.title}
                                >
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
    children,
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
            <SidebarRoot
                collapsible={collapsible}
                className={cn(
                    "border-r md:block md:w-64 md:h-full",
                    !isMobile && "w-64"
                )}
            >
                <ChaptersList chapters={chapters} title={title} />
            </SidebarRoot>
            <div className="flex-1 w-full">
                <SidebarToggler />
                {children}
            </div>
        </SidebarProvider>
    );
}

