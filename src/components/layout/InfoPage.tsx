import { Markdown } from "@/components/ui/Markdown";

/** A text page (About, Contact, the legal pages), written in Markdown. */
export function InfoPage({ title, updated, children }: { title: string; updated?: string; children: string }) {
  return (
    <article className="mx-auto max-w-3xl animate-fade-up py-4">
      <h1 className="text-4xl leading-tight text-slate-900 sm:text-5xl">{title}</h1>
      {updated && <p className="mt-2 text-sm text-slate-600">Last updated: {updated}</p>}
      <Markdown
        variant="plain"
        className="mt-8 border-t border-slate-200 pt-2 prose-h2:mt-10 prose-h2:font-display prose-h2:text-2xl prose-h2:font-semibold prose-a:font-semibold prose-a:text-brand-700"
      >
        {children}
      </Markdown>
    </article>
  );
}
