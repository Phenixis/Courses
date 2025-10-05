"use client";

import { useEffect, useRef, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Chapter } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function Editor({
                           chapter,
                       }: {
    chapter: Chapter
}) {
    const router = useRouter();
    const [title, setTitle] = useState<string>(chapter.title ?? "");
    const [initialTitle, setInitialTitle] = useState<string>(chapter.title ?? "");
    const [value, setValue] = useState<string>(chapter.content ?? "");
    const [initialValue, setInitialValue] = useState<string>(chapter.content ?? "");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [hasChanged, setHasChanged] = useState<boolean>(false);
    const [colorMode, setColorMode] = useState<string>("light");
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const statusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Initial check
        setColorMode(document.documentElement.classList.contains("dark") ? "dark" : "light");

        // Create a MutationObserver to watch for class changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    setColorMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
                }
            });
        });

        // Start observing the document element for class changes
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        // Cleanup observer on component unmount
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (title !== initialTitle || value !== initialValue) {
            setHasChanged(true);
        } else {
            setHasChanged(false);
        }
    }, [title, value, initialTitle, initialValue]);

    useEffect(() => {
        return () => {
            if (statusTimeout.current) {
                clearTimeout(statusTimeout.current);
            }
        };
    }, []);

    const handleSave = async () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError("Chapter title cannot be empty.");
            return;
        }

        const payload: Record<string, string | null> = {};
        if (trimmedTitle !== initialTitle) {
            payload.title = trimmedTitle;
        }
        if (value !== initialValue) {
            payload.content = value.length === 0 ? null : value;
        }

        if (Object.keys(payload).length === 0) {
            return;
        }

        setIsSaving(true);
        setError(null);
        setStatusMessage(null);

        try {
            const response = await fetch(`/api/chapters/${chapter.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error || `Failed to save (status ${response.status})`);
            }

            const updated: Chapter = await response.json();
            const nextTitle = updated.title ?? trimmedTitle;
            const nextContent = updated.content ?? "";

            setTitle(nextTitle);
            setInitialTitle(nextTitle);
            setValue(nextContent);
            setInitialValue(nextContent);
            setHasChanged(false);

            router.refresh();

            setStatusMessage("Changes saved");
            if (statusTimeout.current) {
                clearTimeout(statusTimeout.current);
            }
            statusTimeout.current = setTimeout(() => {
                setStatusMessage(null);
                statusTimeout.current = null;
            }, 3000);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || "Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container h-full" data-color-mode={colorMode}>
            <div className="flex flex-col gap-2 px-2 py-4">
                <Label htmlFor="chapter-title" className="text-sm font-medium">
                    Chapter title
                </Label>
                <Input
                    id="chapter-title"
                    value={title}
                    onChange={(event) => {
                        if (error) {
                            setError(null);
                        }
                        if (statusMessage) {
                            setStatusMessage(null);
                            if (statusTimeout.current) {
                                clearTimeout(statusTimeout.current);
                                statusTimeout.current = null;
                            }
                        }
                        setTitle(event.target.value);
                    }}
                    disabled={isSaving}
                />
                {error && (
                    <p className="text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
                {statusMessage && (
                    <p className="text-sm text-muted-foreground" role="status">
                        {statusMessage}
                    </p>
                )}
            </div>
            <MDEditor
                value={value}
                onChange={(nextValue) => {
                    if (statusMessage) {
                        setStatusMessage(null);
                        if (statusTimeout.current) {
                            clearTimeout(statusTimeout.current);
                            statusTimeout.current = null;
                        }
                    }
                    setValue(nextValue ?? "");
                }}
                className="m-2 !h-[75%]"
                style={{
                    height: "500px",
                }}
            />
            <div className="flex justify-end mt-2">
                <Button
                    onClick={handleSave}
                    variant={"default"}
                    size={"lg"}
                    disabled={isSaving || !hasChanged}
                >
                    {
                        isSaving ? "Saving..." : !hasChanged ? "No changes" : "Save Changes"
                    }
                </Button>
            </div>
        </div>
    );
}