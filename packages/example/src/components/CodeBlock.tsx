"use client";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
      <code className="mono text-sm text-zinc-300 bg-transparent px-0 py-0">{code}</code>
    </pre>
  );
}
