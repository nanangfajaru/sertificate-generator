import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugifyHeading } from "@/lib/blog";

const text = (c: React.ReactNode): string => (Array.isArray(c) ? c.map(text).join("") : typeof c === "string" || typeof c === "number" ? String(c) : c && typeof c === "object" && "props" in c ? text((c as { props: { children?: React.ReactNode } }).props.children) : "");

/** Markdown artikel (dirender di server, tanpa HTML mentah). */
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-blog">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children: c }) => <h2 id={slugifyHeading(text(c))}>{c}</h2>,
          a: ({ href = "", children: c }) =>
            href.startsWith("/") ? <Link href={href}>{c}</Link> : <a href={href} target="_blank" rel="noopener noreferrer">{c}</a>,
          table: ({ children: c }) => <div className="table-wrap"><table>{c}</table></div>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
