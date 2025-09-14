"use client";

import React, { useMemo } from "react";
import { marked, type Tokens } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

/*
  MarkdownViewer
  - Converts markdown string to sanitized HTML (using marked + DOMPurify)
  - Adds id anchors to headings for deep-linking
  - Opens external links in new tab (rel noopener)
  - Optional inline rendering (no surrounding block styling)
  - Safe by default; can disable sanitization (not recommended) for trusted content
*/

export interface MarkdownViewerProps {
  markdown: string;
  className?: string;
  /** When true, don't wrap with prose styles */
  inline?: boolean;
  /** Disable sanitation (only for fully trusted content) */
  unsafeDisableSanitization?: boolean;
  /** Override simple marked options (subset: gfm, breaks) */
  markedOptions?: Partial<Pick<ReturnType<typeof marked.getDefaults>, 'gfm' | 'breaks'>>;
}

// Configure a base marked instance (token-based renderer overrides for v13)
const renderer = new marked.Renderer();

renderer.heading = (token: Tokens.Heading) => {
  const slug = (token.text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
return `<h${token.depth} id="${slug}" class="group scroll-mt-20 font-bold text-${token.depth === 1 ? "3xl" : token.depth === 2 ? "2xl" : "xl"} mb-2">
    <a href="#${slug}" class="no-underline">${token.text}</a>
</h${token.depth}>`;
};

renderer.link = (token: Tokens.Link) => {
  const href = token.href || "#";
  const title = token.title ? ` title="${token.title}"` : "";
  const isExternal = /^(https?:)?\/\//.test(href);
  const base = `<a href="${href}"${title}`;
  const cls = ' class="underline decoration-muted-foreground/40 hover:decoration-foreground"';
  if (isExternal) {
    return `${base}${cls} target="_blank" rel="noopener noreferrer">${token.text}</a>`;
  }
  return `${base}${cls}>${token.text}</a>`;
};

renderer.code = (token: Tokens.Code) => {
  const lang = token.lang || "";
  return `<pre class=\"rounded-md bg-muted p-3 overflow-x-auto text-sm\"><code class=\"language-${lang}\">${escapeHtml(token.text)}</code></pre>`;
};

renderer.blockquote = (token: Tokens.Blockquote) => {
  return `<blockquote class=\"border-l-4 pl-4 italic text-muted-foreground\">${token.text}</blockquote>`;
};

renderer.list = (token: Tokens.List) => {
  const { ordered, start, items } = token;
  const tag = ordered ? "ol" : "ul";
  const startAttr = ordered && start && start !== 1 ? ` start=\"${start}\"` : "";
  const body = items.map(i => `<li>${i.text}</li>`).join("");
  return `<${tag}${startAttr} class=\"pl-5 space-y-1 list-${ordered ? 'decimal' : 'disc'}\">${body}</${tag}>`;
};

marked.setOptions({ gfm: true, breaks: true, renderer });

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  markdown,
  className,
  inline = false,
  unsafeDisableSanitization = false,
  markedOptions
}) => {
  const html = useMemo(() => {
    if (markedOptions) {
      marked.setOptions({
        ...marked.getDefaults(),
        gfm: markedOptions.gfm ?? true,
        breaks: markedOptions.breaks ?? true,
        renderer
      });
    }
    const parsed = marked.parse(markdown || "");
    return unsafeDisableSanitization ? (parsed as string) : DOMPurify.sanitize(parsed as string);
  }, [markdown, markedOptions, unsafeDisableSanitization]);

  if (inline) {
    return <span className={cn(className)} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div
      className={cn(
        "prose dark:prose-invert max-w-none prose-pre:p-0 prose-code:before:hidden prose-code:after:hidden",
        "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:text-foreground/90",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownViewer;
