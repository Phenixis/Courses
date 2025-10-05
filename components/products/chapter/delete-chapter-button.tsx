"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export function DeleteChapterButton({ chapterId }: { chapterId: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;
        const confirmed = confirm("Are you sure you want to delete this chapter? This action cannot be undone.");
        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/chapters/${chapterId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to delete chapter");
            }

            const baseEditPath = pathname.replace(/\/edit\/[^/]+$/, "/edit");
            router.push(baseEditPath);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error?.message || "Failed to delete chapter");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="destructive"
            size="lg"
            className="mr-2"
            disabled={isDeleting}
            onClick={handleDelete}
            aria-busy={isDeleting}
        >
            {isDeleting ? "Deleting..." : "Delete Chapter"}
        </Button>
    );
}
