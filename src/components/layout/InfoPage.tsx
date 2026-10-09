import { Markdown } from "@/components/ui/Markdown";

/** A text page (About, Contact, the legal pages), written in Markdown. */
export function InfoPage({ title, updated, children }: { title: string; updated?: string; children: string }) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/5 sm:p-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      {updated && <p className="mt-2 text-sm text-slate-600">Last updated: {updated}</p>}
      <Markdown
        variant="plain"
        className="mt-6 prose-h2:mt-8 prose-h2:text-xl prose-h2:font-extrabold prose-a:font-semibold prose-a:text-brand-700"
      >
        {children}
      </Markdown>
    </article>
  );
}
