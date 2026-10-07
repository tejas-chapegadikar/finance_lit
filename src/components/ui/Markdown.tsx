import ReactMarkdown, { type Components } from "react-markdown";

// "lesson" highlights **bold** terms in the brand blue, so key ideas stand
// out while reading; "plain" keeps bold as bold (for tinted cards).
const HIGHLIGHT: Components = {
  strong: ({ children }) => (
    <strong className="rounded bg-brand-50 px-0.5 font-bold text-brand-800">{children}</strong>
  ),
};

export function Markdown({
  children,
  variant = "lesson",
  className = "",
}: {
  children: string;
  variant?: "lesson" | "plain";
  className?: string;
}) {
  return (
    <div
      className={`prose prose-slate max-w-none prose-p:leading-relaxed prose-li:my-1 prose-ul:my-3 prose-strong:text-slate-900 ${className}`}
    >
      <ReactMarkdown components={variant === "lesson" ? HIGHLIGHT : undefined}>{children}</ReactMarkdown>
    </div>
  );
}
