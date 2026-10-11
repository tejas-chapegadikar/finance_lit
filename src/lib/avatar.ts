import { findBadge } from "./badges";

// The avatar: a set of cosmetic parts, one per slot. Purely cosmetic — no
// item changes anything about learning, XP or scores. Basics are free; store
// items cost XP (a Rewards Store unlock, id = item id); special items unlock
// with a badge or a streak. Kept free of Prisma imports so client components
// can use it.

export type AvatarSlot = "skin" | "hair" | "hairColor" | "eyes" | "top" | "headwear" | "glasses" | "shoes" | "backpack";

export type AvatarUnlock =
  | { type: "free" }
  | { type: "xp"; cost: number }
  | { type: "badge"; badgeId: string }
  | { type: "streak"; days: number };

export type AvatarItem = { id: string; slot: AvatarSlot; name: string; unlock: AvatarUnlock; rare?: boolean };

export type AvatarConfig = Record<AvatarSlot, string>;

export const AVATAR_SLOTS: { slot: AvatarSlot; label: string }[] = [
  { slot: "skin", label: "Skin tone" },
  { slot: "hair", label: "Hairstyle" },
  { slot: "hairColor", label: "Hair colour" },
  { slot: "eyes", label: "Face" },
  { slot: "top", label: "Outfit" },
  { slot: "headwear", label: "Headwear" },
  { slot: "glasses", label: "Glasses" },
  { slot: "shoes", label: "Shoes" },
  { slot: "backpack", label: "Backpack" },
];

const FREE: AvatarUnlock = { type: "free" };
const xp = (cost: number): AvatarUnlock => ({ type: "xp", cost });
const badge = (badgeId: string): AvatarUnlock => ({ type: "badge", badgeId });

export const AVATAR_ITEMS: AvatarItem[] = [
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: `skin-${n}`, slot: "skin" as const, name: `Skin tone ${n}`, unlock: FREE })),

  { id: "hair-short", slot: "hair", name: "Short", unlock: FREE },
  { id: "hair-buzz", slot: "hair", name: "Buzz cut", unlock: FREE },
  { id: "hair-long", slot: "hair", name: "Long", unlock: FREE },
  { id: "hair-curly", slot: "hair", name: "Curly", unlock: FREE },
  { id: "hair-bun", slot: "hair", name: "Top bun", unlock: FREE },
  { id: "hair-spiky", slot: "hair", name: "Spiky", unlock: xp(150) },
  { id: "hair-ponytail", slot: "hair", name: "Ponytail", unlock: xp(150) },

  { id: "hc-black", slot: "hairColor", name: "Black", unlock: FREE },
  { id: "hc-darkbrown", slot: "hairColor", name: "Dark brown", unlock: FREE },
  { id: "hc-brown", slot: "hairColor", name: "Brown", unlock: FREE },
  { id: "hc-auburn", slot: "hairColor", name: "Auburn", unlock: FREE },
  { id: "hc-blue", slot: "hairColor", name: "Electric blue", unlock: xp(150) },
  { id: "hc-pink", slot: "hairColor", name: "Rose pink", unlock: xp(150) },

  { id: "eyes-classic", slot: "eyes", name: "Classic", unlock: FREE },
  { id: "eyes-happy", slot: "eyes", name: "Happy", unlock: FREE },
  { id: "eyes-wink", slot: "eyes", name: "Wink", unlock: FREE },
  { id: "eyes-calm", slot: "eyes", name: "Calm", unlock: FREE },

  { id: "top-tee-sky", slot: "top", name: "Sky tee", unlock: FREE },
  { id: "top-tee-white", slot: "top", name: "White tee", unlock: FREE },
  { id: "top-kurta", slot: "top", name: "Kurta", unlock: FREE },
  { id: "top-hoodie-orange", slot: "top", name: "Orange hoodie", unlock: xp(250) },
  { id: "top-hoodie-navy", slot: "top", name: "Navy hoodie", unlock: xp(250) },
  { id: "top-blazer-gold", slot: "top", name: "Gold blazer", unlock: xp(600), rare: true },
  { id: "top-hoodie-flame", slot: "top", name: "Flame hoodie", unlock: { type: "streak", days: 7 } },
  { id: "top-varsity", slot: "top", name: "Champion varsity jacket", unlock: badge("quiz-champion") },
  { id: "top-gown", slot: "top", name: "Graduate gown", unlock: badge("financial-foundations") },

  { id: "hw-none", slot: "headwear", name: "None", unlock: FREE },
  { id: "hw-cap", slot: "headwear", name: "Sky cap", unlock: xp(100) },
  { id: "hw-beanie", slot: "headwear", name: "Beanie", unlock: xp(100) },
  { id: "hw-gradcap", slot: "headwear", name: "Graduation cap", unlock: badge("financial-foundations") },
  { id: "hw-crown", slot: "headwear", name: "Crown", unlock: { type: "streak", days: 30 } },

  { id: "gl-none", slot: "glasses", name: "None", unlock: FREE },
  { id: "gl-round", slot: "glasses", name: "Round glasses", unlock: xp(100) },
  { id: "gl-square", slot: "glasses", name: "Square glasses", unlock: xp(100) },
  { id: "gl-shades", slot: "glasses", name: "Sunglasses", unlock: xp(100) },
  { id: "gl-star", slot: "glasses", name: "Star shades", unlock: badge("scam-spotter") },

  { id: "sh-canvas", slot: "shoes", name: "Canvas shoes", unlock: FREE },
  { id: "sh-sneakers", slot: "shoes", name: "Sneakers", unlock: xp(300) },
  { id: "sh-hightops", slot: "shoes", name: "High-tops", unlock: xp(300) },
  { id: "sh-gold", slot: "shoes", name: "Gold kicks", unlock: badge("memory-master") },

  { id: "bp-none", slot: "backpack", name: "None", unlock: FREE },
  { id: "bp-campus", slot: "backpack", name: "Campus backpack", unlock: xp(300) },
  { id: "bp-explorer", slot: "backpack", name: "Explorer pack", unlock: badge("scenario-solver") },
];

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "skin-3",
  hair: "hair-short",
  hairColor: "hc-black",
  eyes: "eyes-classic",
  top: "top-tee-sky",
  headwear: "hw-none",
  glasses: "gl-none",
  shoes: "sh-canvas",
  backpack: "bp-none",
};

// Head-and-face slots preview as a close-up; the rest as the full figure.
export const HEAD_SLOTS: AvatarSlot[] = ["skin", "hair", "hairColor", "eyes", "headwear", "glasses"];

export function findAvatarItem(id: string): AvatarItem | undefined {
  return AVATAR_ITEMS.find((item) => item.id === id);
}

/** A stored avatar, with anything missing or unknown replaced by the default. */
export function readAvatar(value: unknown): AvatarConfig {
  const stored = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const config = { ...DEFAULT_AVATAR };
  for (const { slot } of AVATAR_SLOTS) {
    const id = stored[slot];
    if (typeof id === "string" && findAvatarItem(id)?.slot === slot) config[slot] = id;
  }
  return config;
}

export type UnlockContext = { owned: Set<string>; badges: Set<string>; longestStreak: number };

export function isAvatarItemUnlocked(item: AvatarItem, ctx: UnlockContext): boolean {
  switch (item.unlock.type) {
    case "free":
      return true;
    case "xp":
      return ctx.owned.has(item.id);
    case "badge":
      return ctx.badges.has(item.unlock.badgeId);
    case "streak":
      return ctx.longestStreak >= item.unlock.days;
  }
}

/** How to get it, in plain words. */
export function unlockText(item: AvatarItem): string {
  switch (item.unlock.type) {
    case "free":
      return "Free";
    case "xp":
      return `${item.unlock.cost} XP`;
    case "badge":
      return `Earn the ${findBadge(item.unlock.badgeId)?.name ?? ""} badge`;
    case "streak":
      return `Reach a ${item.unlock.days}-day streak`;
  }
}
