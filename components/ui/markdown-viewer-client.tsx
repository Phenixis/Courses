"use client";

import React, { useMemo } from "react";
import { highlight } from "sugar-high";
import Image from "next/image";
import Link from "next/link";

// Lightweight client-side markdown/MDX-like rendering using dynamic import of next-mdx-remote's compile if needed later.
// Currently supports GitHub-flavored markdown basics and code highlighting.
// If true MDX (custom components, imports) is needed, integrate @mdx-js/mdx + runtime transform.

interface ClientMarkdownProps {
  source: string;
  className?: string;
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href || '';
  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }
  if (href.startsWith('#')) {
    return <a {...props} />;
  }
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

interface RoundedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

function RoundedImage({ className, alt, ...props }: RoundedImageProps) {
  return <Image className={`rounded-lg ${className || ''}`} alt={alt} {...props} />;
}

// Simple parser split into blocks; for production consider using a proper markdown lib (remark/rehype) on server.
export const ClientMarkdown: React.FC<ClientMarkdownProps> = ({ source, className }) => {
  const html = useMemo(() => {
    try {
      let out = source || "";
      // Escape HTML basic
      out = out.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Code fences ```
      out = out.replace(/```([\s\S]*?)```/g, (_, code) => {
        const highlighted = highlight(code.trim());
        return `<pre class=\"shj-lang\"><code>${highlighted}</code></pre>`;
      });

      // Headings with anchor links and slugified IDs
      for (let level = 6; level >= 1; level--) {
        const regex = new RegExp(`^${'#'.repeat(level)} (.*)$`, 'gm');
        out = out.replace(regex, (_, text) => {
          const slug = slugify(text);
          return `<h${level} id="${slug}" class="target:border-l-2 target:pl-2"><a href="#${slug}" class="anchor"></a>${text}</h${level}>`;
        });
      }

      // Inline code
      out = out.replace(/`([^`]+)`/g, (_, code) => `<code>${highlight(code)}</code>`);

      // Bold & Italic
      out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Links [text](url)
      out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        if (url.startsWith('/')) {
          return `<a href="${url}" class="internal-link">${text}</a>`;
        }
        if (url.startsWith('#')) {
          return `<a href="${url}" class="hash-link">${text}</a>`;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      });

      // Images ![alt](src)
      out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        return `<img src="${src}" alt="${alt}" class="rounded-lg" />`;
      });

      // Paragraph wrap
      out = out.replace(/^(?!<h\d|<pre|<ul|<li|<p|<blockquote|<code|<a|<strong|<em|<img)([^\n]+)\n?/gm, '<p>$1</p>');

      return out;
    } catch (e) {
      return `<pre class=\"text-red-600\">Markdown preview error: ${(e as Error).message}</pre>`;
    }
  }, [source]);

  // Optionally, could parse and replace <a> and <img> with React components for full parity
  // For now, output is HTML with similar structure/classes to MDX viewer

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
};
