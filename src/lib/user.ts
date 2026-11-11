import type { User } from "@prisma/client";

export function getDisplayName(user: Pick<User, "displayName" | "name" | "email">): string {
  return user.displayName ?? user.name ?? user.email.split("@")[0];
}

/** What Home calls you: the nickname from setup, else your first name. */
export function nicknameOf(user: Pick<User, "displayName" | "name" | "email">): string {
  const nickname = user.displayName?.trim();
  if (nickname) return nickname;
  return user.name?.trim().split(/\s+/)[0] || getDisplayName(user);
}
