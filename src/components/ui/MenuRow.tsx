import { ChevronRightIcon } from "./icons";

// One row of a settings-style list: an icon tile, a label and a chevron.
// Works on a <Link>, <a> or <button> — pass this as its className and
// render <MenuRowContent> inside.
export const menuRowClass =
  "flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-bold transition hover:bg-brand-50 focus-visible:bg-brand-50";

export const menuListClass = "divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200";

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
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          tone === "danger" ? "bg-rose-50 text-rose-700" : "bg-brand-50 text-brand-600"
        }`}
      >
        {icon}
      </span>
      <span className={`flex-1 ${tone === "danger" ? "text-rose-700" : "text-slate-800"}`}>{label}</span>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-400" />
    </>
  );
}
