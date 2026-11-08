import { findBadge } from "./badges";

// The student's own avatar: a soft, rounded 3D-style character that IS the
// student, it carries their account name, never a mascot name of its own.
// Everything here is cosmetic: no item changes learning, XP or scores.
//
// Basics are free; "xp" items unlock on their own once you've earned that
// much XP in total (earlier Rewards Store purchases stay unlocked too);
// special items unlock with a badge, a streak or a number of lessons.
// Slot names and item ids are stored on users and purchases, so they're
// permanent, the earlier human-style avatar's ids map onto this character
// (skin tones are body colours, hairstyles are head tufts, hair colours are
// tuft colours), so nothing anyone saved or bought is lost.
// Kept free of Prisma imports so client components can use it.

export type AvatarSlot = "skin" | "hair" | "hairColor" | "eyes" | "mouth" | "top" | "headwear" | "glasses" | "shoes" | "backpack" | "special";

export type AvatarUnlock =
  | { type: "free" }
  | { type: "xp"; cost: number }
  | { type: "badge"; badgeId: string }
  | { type: "streak"; days: number }
  | { type: "lessons"; count: number };

export type AvatarItem = { id: string; slot: AvatarSlot; name: string; unlock: AvatarUnlock; rare?: boolean };

export type AvatarConfig = Record<AvatarSlot, string>;

/** The Avatar Studio's tabs. */
export type AvatarGroup = "face" | "clothing" | "accessories" | "footwear" | "special";

export const AVATAR_GROUPS: { id: AvatarGroup; label: string }[] = [
  { id: "face", label: "Face" },
  { id: "clothing", label: "Clothing" },
  { id: "accessories", label: "Accessories" },
  { id: "footwear", label: "Footwear" },
  { id: "special", label: "Special" },
];

export const AVATAR_SLOTS: { slot: AvatarSlot; label: string; group: AvatarGroup }[] = [
  { slot: "skin", label: "Body colour", group: "face" },
  { slot: "eyes", label: "Eyes", group: "face" },
  { slot: "mouth", label: "Mouth", group: "face" },
  { slot: "hair", label: "Head tuft", group: "face" },
  { slot: "hairColor", label: "Tuft colour", group: "face" },
  { slot: "top", label: "Outfit", group: "clothing" },
  { slot: "headwear", label: "Headwear", group: "accessories" },
  { slot: "glasses", label: "Glasses", group: "accessories" },
  { slot: "backpack", label: "Bag", group: "accessories" },
  { slot: "shoes", label: "Shoes", group: "footwear" },
  { slot: "special", label: "Special", group: "special" },
];

const FREE: AvatarUnlock = { type: "free" };
const xp = (cost: number): AvatarUnlock => ({ type: "xp", cost });
const badge = (badgeId: string): AvatarUnlock => ({ type: "badge", badgeId });

export const AVATAR_ITEMS: AvatarItem[] = [
  { id: "skin-3", slot: "skin", name: "Marshmallow", unlock: FREE },
  { id: "skin-1", slot: "skin", name: "Cloud white", unlock: FREE },
  { id: "skin-2", slot: "skin", name: "Vanilla", unlock: FREE },
  { id: "skin-4", slot: "skin", name: "Peach", unlock: FREE },
  { id: "skin-5", slot: "skin", name: "Mint", unlock: FREE },
  { id: "skin-6", slot: "skin", name: "Lavender", unlock: FREE },

  { id: "eyes-classic", slot: "eyes", name: "Dot eyes", unlock: FREE },
  { id: "eyes-happy", slot: "eyes", name: "Happy eyes", unlock: FREE },
  { id: "eyes-wink", slot: "eyes", name: "Wink", unlock: FREE },
  { id: "eyes-calm", slot: "eyes", name: "Calm", unlock: FREE },
  { id: "eyes-sparkle", slot: "eyes", name: "Sparkle eyes", unlock: { type: "lessons", count: 3 } },

  { id: "mouth-smile", slot: "mouth", name: "Big smile", unlock: FREE },
  { id: "mouth-grin", slot: "mouth", name: "Grin", unlock: FREE },
  { id: "mouth-smirk", slot: "mouth", name: "Smirk", unlock: FREE },
  { id: "mouth-small", slot: "mouth", name: "Tiny smile", unlock: FREE },
  { id: "mouth-tongue", slot: "mouth", name: "Cheeky", unlock: xp(100) },

  { id: "hair-buzz", slot: "hair", name: "Smooth", unlock: FREE },
  { id: "hair-short", slot: "hair", name: "Single curl", unlock: FREE },
  { id: "hair-curly", slot: "hair", name: "Curly top", unlock: FREE },
  { id: "hair-bun", slot: "hair", name: "Top bun", unlock: FREE },
  { id: "hair-long", slot: "hair", name: "Swoosh", unlock: FREE },
  { id: "hair-spiky", slot: "hair", name: "Spiky", unlock: xp(150) },
  { id: "hair-ponytail", slot: "hair", name: "Sprout", unlock: xp(150) },

  { id: "hc-black", slot: "hairColor", name: "Black", unlock: FREE },
  { id: "hc-darkbrown", slot: "hairColor", name: "Dark brown", unlock: FREE },
  { id: "hc-brown", slot: "hairColor", name: "Brown", unlock: FREE },
  { id: "hc-auburn", slot: "hairColor", name: "Auburn", unlock: FREE },
  { id: "hc-blue", slot: "hairColor", name: "Electric blue", unlock: xp(150) },
  { id: "hc-pink", slot: "hairColor", name: "Rose pink", unlock: xp(150) },

  { id: "top-none", slot: "top", name: "Just you", unlock: FREE },
  { id: "top-tee-sky", slot: "top", name: "Sky tee", unlock: FREE },
  { id: "top-tee-white", slot: "top", name: "White tee", unlock: FREE },
  { id: "top-kurta", slot: "top", name: "Kurta", unlock: FREE },
  { id: "top-shirt-check", slot: "top", name: "Check shirt", unlock: FREE },
  { id: "top-tee-five", slot: "top", name: "High-five tee", unlock: { type: "lessons", count: 5 } },
  { id: "top-hoodie-orange", slot: "top", name: "Orange hoodie", unlock: xp(250) },
  { id: "top-hoodie-navy", slot: "top", name: "Navy hoodie", unlock: xp(250) },
  { id: "top-jacket-denim", slot: "top", name: "Denim jacket", unlock: xp(300) },
  { id: "top-blazer-gold", slot: "top", name: "Gold blazer", unlock: xp(600), rare: true },
  { id: "top-hoodie-flame", slot: "top", name: "Flame hoodie", unlock: { type: "streak", days: 7 } },
  { id: "top-varsity", slot: "top", name: "Champion varsity jacket", unlock: badge("quiz-champion") },
  { id: "top-tracksuit", slot: "top", name: "30-day tracksuit", unlock: badge("habit-builder"), rare: true },
  { id: "top-gown", slot: "top", name: "Graduate gown", unlock: badge("financial-foundations") },

  { id: "hw-none", slot: "headwear", name: "None", unlock: FREE },
  { id: "hw-cap", slot: "headwear", name: "Sky cap", unlock: xp(100) },
  { id: "hw-beanie", slot: "headwear", name: "Beanie", unlock: xp(100) },
  { id: "hw-headphones", slot: "headwear", name: "Headphones", unlock: xp(150) },
  { id: "hw-party", slot: "headwear", name: "Party hat", unlock: badge("goal-getter") },
  { id: "hw-gradcap", slot: "headwear", name: "Graduation cap", unlock: badge("financial-foundations") },
  { id: "hw-crown", slot: "headwear", name: "Crown", unlock: { type: "streak", days: 30 }, rare: true },

  { id: "gl-none", slot: "glasses", name: "None", unlock: FREE },
  { id: "gl-round", slot: "glasses", name: "Round glasses", unlock: xp(100) },
  { id: "gl-square", slot: "glasses", name: "Square glasses", unlock: xp(100) },
  { id: "gl-shades", slot: "glasses", name: "Sunglasses", unlock: xp(100) },
  { id: "gl-star", slot: "glasses", name: "Star shades", unlock: badge("scam-spotter") },

  { id: "bp-none", slot: "backpack", name: "None", unlock: FREE },
  { id: "bp-campus", slot: "backpack", name: "Campus backpack", unlock: xp(300) },
  { id: "bp-explorer", slot: "backpack", name: "Explorer pack", unlock: badge("scenario-solver") },

  { id: "sh-none", slot: "shoes", name: "Barefoot", unlock: FREE },
  { id: "sh-canvas", slot: "shoes", name: "Canvas shoes", unlock: FREE },
  { id: "sh-sneakers", slot: "shoes", name: "Sneakers", unlock: xp(300) },
  { id: "sh-hightops", slot: "shoes", name: "High-tops", unlock: xp(300) },
  { id: "sh-gold", slot: "shoes", name: "Gold kicks", unlock: badge("memory-master"), rare: true },

  { id: "sp-none", slot: "special", name: "None", unlock: FREE },
  { id: "sp-sparkles", slot: "special", name: "First-lesson sparkles", unlock: badge("first-lesson") },
  { id: "sp-confetti", slot: "special", name: "Savings confetti", unlock: badge("goal-getter") },
  { id: "sp-medal", slot: "special", name: "Streak medal", unlock: badge("seven-day-learner") },
  { id: "sp-trophy", slot: "special", name: "30-day trophy", unlock: badge("habit-builder"), rare: true },
  { id: "sp-cape", slot: "special", name: "Graduate cape", unlock: badge("financial-foundations"), rare: true },
];

/** Every new student starts as this: a soft white character, nothing else. */
export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "skin-3",
  hair: "hair-buzz",
  hairColor: "hc-black",
  eyes: "eyes-classic",
  mouth: "mouth-smile",
  top: "top-none",
  headwear: "hw-none",
  glasses: "gl-none",
  shoes: "sh-none",
  backpack: "bp-none",
  special: "sp-none",
};

// Face slots preview as a close-up; the rest as the full figure.
export const HEAD_SLOTS: AvatarSlot[] = ["skin", "hair", "hairColor", "eyes", "mouth", "headwear", "glasses"];

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

export type UnlockContext = { owned: Set<string>; badges: Set<string>; longestStreak: number; lessonsCompleted: number; xpTotal: number };

export function isAvatarItemUnlocked(item: AvatarItem, ctx: UnlockContext): boolean {
  switch (item.unlock.type) {
    case "free":
      return true;
    case "xp":
      return ctx.owned.has(item.id) || ctx.xpTotal >= item.unlock.cost;
    case "badge":
      return ctx.badges.has(item.unlock.badgeId);
    case "streak":
      return ctx.longestStreak >= item.unlock.days;
    case "lessons":
      return ctx.lessonsCompleted >= item.unlock.count;
  }
}

/** How to get it, in plain words. */
export function unlockText(item: AvatarItem): string {
  switch (item.unlock.type) {
    case "free":
      return "Free";
    case "xp":
      return `Earn ${item.unlock.cost} XP`;
    case "badge":
      return `Earn the ${findBadge(item.unlock.badgeId)?.name ?? ""} badge`;
    case "streak":
      return `Reach a ${item.unlock.days}-day streak`;
    case "lessons":
      return `Complete ${item.unlock.count} lessons`;
  }
}

/** The avatar's name is always the student's own account name. */
export const avatarName = (user: { displayName: string | null; name: string | null }) =>
  user.displayName?.trim() || user.name?.trim().split(/\s+/)[0] || "You";
