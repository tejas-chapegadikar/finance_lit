import type { AvatarConfig } from "@/lib/avatar";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import { Avatar, type Expression } from "@/components/avatar/Avatar";

/** An empty state where the avatar explains what to do, with one button to do it. */
export function AvatarEmpty({
  text,
  avatar = DEFAULT_AVATAR,
  expression = "thinking",
  children,
}: {
  text: string;
  avatar?: AvatarConfig;
  expression?: Expression;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center">
      <div className="flex items-end gap-2">
        <Avatar config={avatar} expression={expression} crop="head" alive className="h-14 w-14 shrink-0" label="Your avatar" />
        <p className="mb-3 max-w-[15rem] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-left text-sm leading-snug font-medium text-slate-800">{text}</p>
      </div>
      {children}
    </div>
  );
}
