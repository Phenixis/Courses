"use client";

import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Chapter } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";

export function Editor({
                           chapter,
                       }: {
    chapter: Chapter
}) {
    const initialValue = chapter.content;
    const [value, setValue] = useState<string | undefined>(chapter.content);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [hasChanged, setHasChanged] = useState<boolean>(false);
    const [colorMode, setColorMode] = useState<string>("light");

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
        if (initialValue !== value) {
            setHasChanged(true);
        } else {
            setHasChanged(false);
        }
    }, [value]);

    return (
        <div className="container h-full" data-color-mode={colorMode}>
            <MDEditor
                value={value}
                onChange={setValue}
                style={{
                    height: "500px",
                }}
            />
            <div className="flex justify-end mt-2">
                <Button
                    onClick={() => {
                        console.log("Saving value...");
                        setIsSaving(true);
                        fetch(`/api/chapters/${chapter.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ content: value ?? null })
                        }).then(async (res) => {
                            if (!res.ok) {
                                const err = await res.json().catch(() => ({}));
                                throw new Error(err?.error || `Failed to save (status ${res.status})`);
                            }
                            return res.json();
                        }).then(() => {
                            console.log("Value saved");
                        }).catch((e) => {
                            console.error(e);
                            alert(e.message || "Failed to save changes");
                        }).finally(() => {
                            setIsSaving(false);
                        });
                    }}
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