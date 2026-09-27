import type { User } from "@prisma/client";

export function getDisplayName(user: Pick<User, "displayName" | "name" | "email">): string {
  return user.displayName ?? user.name ?? user.email.split("@")[0];
}
