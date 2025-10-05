"use client"

import { useState } from "react";
import MDEditor from '@uiw/react-md-editor';
import { Chapter } from "@/lib/db/schema";

export function Editor({
    chapter
} : {
    chapter: Chapter
}) {
    const [value, setValue] = useState<string | undefined>(chapter.content);

    return (
        <div className="container">
            <MDEditor
                value={value}
                onChange={setValue}
            />
            <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />
        </div>
    );
}