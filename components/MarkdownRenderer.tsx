"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <article className={`prose prose-neutral lg:prose-lg xl:prose-xl ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
}
