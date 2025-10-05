"use client";

import MDEditor from '@uiw/react-md-editor';

export function Preview({
    source,
}: {
    source: string;
}) {
    return (
        <MDEditor.Markdown
            source={source}
            className='!bg-gray-50 dark:!bg-gray-900 pl-6 p-2'
        />
    )
}