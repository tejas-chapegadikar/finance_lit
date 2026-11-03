import ReactMarkdown, { type Components } from "react-markdown";

// "lesson" marks **bold** terms with a soft highlighter stroke, so key ideas
// stand out while reading without turning the text violet; "plain" keeps
// bold as bold (for tinted panels).
const HIGHLIGHT: Components = {
  strong: ({ children }) => (
    <strong className="bg-[linear-gradient(transparent_62%,var(--color-brand-100)_62%)] font-semibold text-slate-900">{children}</strong>
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
      className={`prose prose-slate max-w-none text-[16.5px] leading-[1.7] prose-p:my-3 prose-li:my-1 prose-ul:my-3 prose-strong:font-semibold prose-strong:text-slate-900 sm:text-[17px] ${className}`}
    >
      <ReactMarkdown components={variant === "lesson" ? HIGHLIGHT : undefined}>{children}</ReactMarkdown>
    </div>
  );
}
