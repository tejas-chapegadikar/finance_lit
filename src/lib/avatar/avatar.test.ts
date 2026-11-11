import { test } from "node:test";
import assert from "node:assert/strict";
import { AVATAR_ITEMS, AVATAR_SLOTS, DEFAULT_AVATAR, avatarName, isAvatarItemUnlocked, readAvatar } from "../avatar";
import { REACTIONS, reactionText, type ReactionKind } from "./reactions";

test("an avatar saved before the redesign still loads, keeping every valid choice", () => {
  // A real pre-redesign config: human-style ids, no mouth/special slots.
  const old = {
    skin: "skin-5",
    hair: "hair-spiky",
    hairColor: "hc-blue",
    eyes: "eyes-wink",
    top: "top-hoodie-orange",
    headwear: "hw-cap",
    glasses: "gl-round",
    shoes: "sh-sneakers",
    backpack: "bp-campus",
  };
  const config = readAvatar(old);
  for (const [slot, id] of Object.entries(old)) assert.equal(config[slot as keyof typeof config], id, slot);
  assert.equal(config.mouth, DEFAULT_AVATAR.mouth);
  assert.equal(config.special, DEFAULT_AVATAR.special);
});

test("unknown or wrong-slot items fall back to the default", () => {
  const config = readAvatar({ top: "hw-crown", glasses: "made-up", skin: 42 });
  assert.equal(config.top, DEFAULT_AVATAR.top);
  assert.equal(config.glasses, DEFAULT_AVATAR.glasses);
  assert.equal(config.skin, DEFAULT_AVATAR.skin);
  assert.deepEqual(readAvatar(null), DEFAULT_AVATAR);
});

test("every item id is unique, every slot has a free option, and the default is all free", () => {
  const ids = AVATAR_ITEMS.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const { slot } of AVATAR_SLOTS)
    assert.ok(
      AVATAR_ITEMS.some((i) => i.slot === slot && i.unlock.type === "free"),
      `${slot} needs a free item`,
    );
  for (const id of Object.values(DEFAULT_AVATAR)) assert.equal(AVATAR_ITEMS.find((i) => i.id === id)?.unlock.type, "free", id);
});

test("unlock rules: XP items open at an XP milestone (or an old purchase), others at theirs", () => {
  const base = { owned: new Set<string>(), badges: new Set<string>(), longestStreak: 0, lessonsCompleted: 0, xpTotal: 0 };
  const item = (id: string) => AVATAR_ITEMS.find((i) => i.id === id)!;
  assert.equal(isAvatarItemUnlocked(item("top-tee-five"), { ...base, lessonsCompleted: 4 }), false);
  assert.equal(isAvatarItemUnlocked(item("top-tee-five"), { ...base, lessonsCompleted: 5 }), true);
  assert.equal(isAvatarItemUnlocked(item("hw-cap"), base), false);
  assert.equal(isAvatarItemUnlocked(item("hw-cap"), { ...base, owned: new Set(["hw-cap"]) }), true, "an earlier purchase stays unlocked");
  assert.equal(isAvatarItemUnlocked(item("hw-cap"), { ...base, xpTotal: 99 }), false);
  assert.equal(isAvatarItemUnlocked(item("hw-cap"), { ...base, xpTotal: 100 }), true, "XP items unlock at their XP milestone");
  assert.equal(isAvatarItemUnlocked(item("top-tracksuit"), { ...base, badges: new Set(["habit-builder"]) }), true);
  assert.equal(isAvatarItemUnlocked(item("hw-crown"), { ...base, longestStreak: 29 }), false);
  assert.equal(isAvatarItemUnlocked(item("hw-crown"), { ...base, longestStreak: 30 }), true);
});

test("the avatar's name is always the student's own", () => {
  assert.equal(avatarName({ displayName: "Riya", name: "Riya Sharma" }), "Riya");
  assert.equal(avatarName({ displayName: null, name: "Rahul Verma" }), "Rahul");
  assert.equal(avatarName({ displayName: "  ", name: null }), "You");
});

test("every moment has words, and the blanks get filled", () => {
  const data = {
    label: "Food",
    pct: 85,
    goal: "Goa trip",
    title: "Budgeting",
    days: 7,
    xp: 500,
    badge: "Goal Getter",
    rank: "Budget Boss",
    item: "Party hat",
    level: 1,
    day: 3,
    week: 1,
    amount: "₹500",
  };
  for (const kind of Object.keys(REACTIONS) as ReactionKind[]) {
    for (let i = 0; i < 6; i++) {
      const { text, title } = reactionText(kind, data, "Zorawar", `event-${i}`);
      assert.ok(text.length > 5 && !text.includes("{") && !text.includes("undefined"), `${kind}: ${text}`);
      if (title) assert.ok(!title.includes("{"), title);
    }
  }
});

test("a line with a missing detail is skipped (older events)", () => {
  for (let i = 0; i < 10; i++) assert.ok(!reactionText("deposit", { goal: "Laptop", amount: "₹200" }, "A", `e${i}`).text.includes("%"));
});
