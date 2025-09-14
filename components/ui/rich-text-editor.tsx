"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { Bold, Italic, Underline, List, ListOrdered, Code, Link as LinkIcon, Heading1, Heading2, Heading3, Strikethrough, Quote, X } from "lucide-react";

// NOTE: This is a markdown editor (not WYSIWYG). Persist the `value` string directly.
// To render elsewhere, use the `MarkdownViewer` component which sanitizes + converts.

/*
  Markdown-focused editor.
  Stores and emits markdown only; use `MarkdownViewer` to render.
  Toolbar inserts or wraps selected text with markdown tokens.
*/

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ className, children, ...props }) => (
    <button
        type="button"
        className={cn(
            "h-8 w-8 inline-flex items-center justify-center rounded-md border bg-background text-xs hover:bg-accent hover:text-accent-foreground transition-colors",
            className
        )}
        {...props}
    >
        {children}
    </button>
);

export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    toolbarClassName?: string;
    disabled?: boolean;
    id?: string;
}

function surround(selection: string, before: string, after: string = before) {
    if (!selection) return `${before}${after}`; // insert tokens
    return `${before}${selection}${after}`;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = "Write markdown...",
    className,
    toolbarClassName,
    disabled,
    id
}) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Determine word boundaries excluding punctuation .,;:!? at edges
    const getWordBounds = (text: string, index: number) => {
        const isWordChar = (ch: string) => /[A-Za-z0-9_]/.test(ch);
        let start = index;
        while (start > 0 && isWordChar(text[start - 1])) start--;
        let end = index;
        while (end < text.length && isWordChar(text[end])) end++;
        // Extend to include internal apostrophes (e.g., don't)
        if (start > 0 && text[start - 1] === "'" && isWordChar(text[start])) start--;
        if (end < text.length && text[end] === "'" && isWordChar(text[end - 1])) end++;
        return { start, end };
    };

    const apply = (transform: (current: string, sel: string, start: number, end: number) => { text: string; newStart?: number; newEnd?: number }) => {
        if (!textareaRef.current) return;
        const el = textareaRef.current;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = el.value.slice(start, end);
        const result = transform(el.value, selected, start, end);
        onChange(result.text);
        requestAnimationFrame(() => {
            if (typeof result.newStart === "number") el.selectionStart = result.newStart;
            if (typeof result.newEnd === "number") el.selectionEnd = result.newEnd ?? result.newStart ?? end;
            el.focus();
        });
    };

    const insertInline = (token: string) => {
        apply((current, sel, start, end) => {
            // If no selection, try to toggle token at cursor word
            if (sel.length === 0) {
                const { start: wordStart, end: rawWordEnd } = getWordBounds(current, start);
                let wordEnd = rawWordEnd;
                while (wordEnd > wordStart && /[.,;:!?]/.test(current[wordEnd - 1])) wordEnd--;
                const core = current.slice(wordStart, wordEnd);

                // Check for tokens surrounding core word (outside bounds) like **word**
                const beforeTokenStart = wordStart - token.length;
                const afterTokenEnd = wordEnd + token.length;
                const hasOuter = beforeTokenStart >= 0 && current.slice(beforeTokenStart, wordStart) === token && current.slice(wordEnd, afterTokenEnd) === token;

                if (hasOuter) {
                    const text = current.slice(0, beforeTokenStart) + core + current.slice(afterTokenEnd);
                    const newCaret = beforeTokenStart + core.length;
                    return { text, newStart: newCaret, newEnd: newCaret };
                }

                // Check if tokens already inside core (legacy case **word** captured as word)
                const hasInner = core.startsWith(token) && core.endsWith(token) && core.length >= token.length * 2;
                if (hasInner) {
                    const inner = core.slice(token.length, core.length - token.length);
                    const text = current.slice(0, wordStart) + inner + current.slice(wordEnd);
                    const relative = start - (wordStart + token.length);
                    const unclamped = wordStart + Math.min(relative, inner.length);
                    const newPos = Math.max(wordStart, unclamped);
                    return { text, newStart: newPos, newEnd: newPos };
                }

                // Insert new tokens outside the core word
                const wrapped = token + core + token;
                const text = current.slice(0, wordStart) + wrapped + current.slice(wordEnd);
                const relative = start - wordStart;
                const posStart = wordStart + token.length + Math.min(relative, core.length);
                return { text, newStart: posStart, newEnd: posStart };
            }

            const hasTokens = sel.startsWith(token) && sel.endsWith(token) && sel.length >= token.length * 2;
            if (hasTokens) {
                const inner = sel.slice(token.length, sel.length - token.length);
                const text = current.slice(0, start) + inner + current.slice(end);
                return { text, newStart: start, newEnd: start + inner.length }; // keep selection
            }
            const wrapped = surround(sel, token);
            const text = current.slice(0, start) + wrapped + current.slice(end);
            const pos = start + token.length;
            return { text, newStart: pos, newEnd: pos + sel.length };
        });
    };

    const insertHeading = (level: 1 | 2 | 3) => {
        apply((current, sel, start, end) => {
            const lineStart = current.lastIndexOf("\n", start - 1) + 1;
            const prefix = "#".repeat(level) + " ";
            const already = current.slice(lineStart, lineStart + prefix.length) === prefix;
            const text = already
                ? current
                : current.slice(0, lineStart) + prefix + current.slice(lineStart);
            const shift = already ? 0 : prefix.length;
            return { text, newStart: start + shift, newEnd: end + shift };
        });
    };

    const insertList = (ordered: boolean) => {
        apply((current, sel, start, end) => {
            const block = sel || "List item";
            const list = block
                .split(/\n/)
                .map((l, idx) => (ordered ? `${idx + 1}. ${l || "item"}` : `- ${l || "item"}`))
                .join("\n");
            const text = current.slice(0, start) + list + current.slice(end);
            return { text, newStart: start, newEnd: start + list.length };
        });
    };

    const insertCode = () => {
        apply((current, sel, start, end) => {
            const multiline = sel.includes("\n");
            const token = multiline ? "```\n" + sel + "\n```" : surround(sel, "`");
            const text = current.slice(0, start) + token + current.slice(end);
            return { text, newStart: start + (multiline ? 4 : 1), newEnd: start + token.length - (multiline ? 4 : 1) };
        });
    };

    const insertLink = () => {
        const url = prompt("URL:") || "https://";
        apply((current, sel, start, end) => {
            const label = sel || "link";
            const token = `[${label}](${url})`;
            const text = current.slice(0, start) + token + current.slice(end);
            const labelStart = start + 1;
            return { text, newStart: labelStart, newEnd: labelStart + label.length };
        });
    };

    const insertQuote = () => {
        apply((current, sel, start, end) => {
            const block = sel || "Quote";
            const quoted = block
                .split(/\n/)
                .map(l => "> " + l)
                .join("\n");
            const text = current.slice(0, start) + quoted + current.slice(end);
            return { text, newStart: start, newEnd: start + quoted.length };
        });
    };

    const clearAll = () => {
        if (confirm("Clear editor content?")) onChange("");
    };

    return (
        <div className={cn("rounded-md border flex flex-col", className)}>
            <div className={cn("flex flex-wrap gap-1 border-b p-1 bg-muted/50", toolbarClassName)}>
                <ToolbarButton onClick={() => insertHeading(1)} title="Heading 1"><Heading1 className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={() => insertHeading(2)} title="Heading 2"><Heading2 className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={() => insertHeading(3)} title="Heading 3"><Heading3 className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={() => insertInline("**")} title="Bold"><Bold className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={() => insertInline("*")} title="Italic"><Italic className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={() => insertInline("~~")} title="Strikethrough"><Strikethrough className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={() => insertInline("__")} title="Underline (semantic)"><Underline className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={() => insertList(false)} title="Bullet list"><List className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={() => insertList(true)} title="Numbered list"><ListOrdered className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={insertCode} title="Code"><Code className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={insertLink} title="Link"><LinkIcon className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={insertQuote} title="Quote"><Quote className="h-4 w-4" /></ToolbarButton>
                <ToolbarButton onClick={clearAll} title="Clear"><X className="h-4 w-4" /></ToolbarButton>
            </div>
            <textarea
                id={id}
                ref={textareaRef}
                className={cn(
                    "min-h-[240px] w-full resize-y bg-transparent p-3 font-mono text-sm outline-none disabled:opacity-50",
                    disabled && "cursor-not-allowed"
                )}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                spellCheck={true}
            />
            <div className="flex items-center justify-between border-t bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
                <span>{value.length} chars</span>
                <span>{value.split(/\s+/).filter(Boolean).length} words</span>
            </div>
        </div>
    );
};

export default RichTextEditor;
