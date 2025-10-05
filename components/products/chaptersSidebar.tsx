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
import { useState } from "react";
import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

export interface ChaptersSidebarProps {
    chapters: Chapter[];
    title?: string;
    className?: string;
    showTriggerOnMobile?: boolean; // hide if parent supplies its own trigger
    children?: React.ReactNode;
    isInEdit?: boolean;
    isAdmin?: boolean;
    stripeProductId: string;
    productSlug: string;
}

function findBasePathname(pathname: string) {
    const parts = pathname.split("/").slice(1);

    if (!(parts.length === 2 || parts[parts.length - 1] === "edit")) {
        parts.pop()
    }

    return parts.join("/");
}

function ChaptersList({
    chapters,
    title = "Chapters",
    isInEdit,
    isAdmin,
    stripeProductId,
    productSlug
}: Pick<
    ChaptersSidebarProps,
    "chapters" | "title" | "isInEdit" | "isAdmin" | "stripeProductId" | "productSlug"
>) {
    const pathname = usePathname();
    const router = useRouter();
    const basePathname = findBasePathname(pathname);
    const chapterIdParam = pathname.split("/").pop();
    const activeChapterNumero = chapterIdParam ? parseInt(chapterIdParam, 10) : 0;
    const isMobile = useIsMobile();
    const computedIsInEdit = typeof isInEdit === "boolean" ? isInEdit : pathname.includes("/edit");
    const [isCreating, setIsCreating] = useState(false);

    const handleAddChapter = async () => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const response = await fetch("/api/chapters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stripeProductId }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to create chapter");
            }

            const createdChapter: Chapter = await response.json();
            router.push(`/courses/${productSlug}/edit/${createdChapter.numero}`);
            router.refresh();
        } catch (error: any) {
            console.error("Failed to create chapter", error);
            alert(error?.message || "Failed to create chapter");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <SidebarContent className="pt-0">
            <SidebarGroup className={`p-2 ${isMobile ? 'my-auto' : ''}`}>
                <SidebarMenu className={`flex flex-col justify-between ${isMobile ? 'my-auto' : ''}`}>
                    {chapters.length === 0 && (
                        <div className="text-xs text-muted-foreground px-2 py-4">
                            No chapters yet.
                        </div>
                    )}
                    {chapters.map((chapter, idx) => {
                        const isActive = chapter.numero === activeChapterNumero;
                        return (
                            <SidebarMenuItem key={chapter.id}>
                                <Link href={'/' + basePathname + '/' + chapter.numero}>
                                    <SidebarMenuButton
                                        isActive={isActive}
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
                                </Link>
                            </SidebarMenuItem>
                        );
                    })}
                    {computedIsInEdit && isAdmin && (
                        <SidebarMenuItem>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleAddChapter}
                                disabled={isCreating}
                                aria-busy={isCreating}
                            >
                                <Plus className="mr-2" size={16} />
                                {isCreating ? "Creating..." : "Add Chapter"}
                            </Button>
                        </SidebarMenuItem>
                    )}
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
    isInEdit,
    isAdmin,
    stripeProductId,
    productSlug
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
                    !isMobile && "w-64",
                    className
                )}
            >
                <ChaptersList
                    chapters={chapters}
                    title={title}
                    isInEdit={isInEdit}
                    isAdmin={isAdmin}
                    stripeProductId={stripeProductId}
                    productSlug={productSlug}
                />
            </SidebarRoot>
            <div className="flex-1 w-full">
                <SidebarToggler />
                {children}
            </div>
        </SidebarProvider>
    );
}

