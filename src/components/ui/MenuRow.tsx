import { ChevronRightIcon } from "./icons";

// One row of a settings-style list: an icon tile, a label and a chevron.
// Works on a <Link>, <a> or <button>, pass this as its className and
// render <MenuRowContent> inside.
export const menuRowClass =
  "group flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-slate-50 focus-visible:bg-slate-50";

export const menuListClass = "divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white";

export function MenuRowContent({
  icon,
  label,
  tone = "brand",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "brand" | "danger";
}) {
  return (
    <>
      <span
        aria-hidden
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4 ${
          tone === "danger" ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        {icon}
      </span>
      <span className={`flex-1 ${tone === "danger" ? "text-rose-700" : "text-slate-800"}`}>{label}</span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5" />
    </>
  );
}
