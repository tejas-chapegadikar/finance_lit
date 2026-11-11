import assert from "node:assert/strict";
import test from "node:test";
import * as buddy from "./buddy-messages";

// The buddy's writing rules, checked on every line in buddy-messages.ts.

const all: string[] = [];
const groups: string[][] = [];
const walk = (v: unknown) => {
  if (typeof v === "string") all.push(v);
  else if (Array.isArray(v)) {
    if (v.length && v.every((x) => typeof x === "string")) groups.push(v as string[]);
    v.forEach(walk);
  } else if (v && typeof v === "object") Object.values(v).forEach(walk);
};
walk(Object.fromEntries(Object.entries(buddy).filter(([k, v]) => typeof v !== "function" && k !== "HUB_OPTIONS")));

const SAMPLE: Record<string, string | number> = {
  lesson: "Credit Cards 101",
  minutes: 6,
  level: 2,
  xp: "1,500",
  amount: "₹1,840",
  place: "Swiggy",
  count: 3,
  time: "2 AM",
  each: "₹20",
  thing: "chai",
  total: "₹280",
  weekday: "Wednesday",
  days: 7,
  goal: "Laptop fund",
  pct: 42,
  name: "Riya",
  label: "Food",
  title: "Budgeting",
  badge: "Goal Getter",
  rank: "Budget Boss",
  item: "Party hat",
  day: 3,
  week: 1,
};

test("English only: no Hindi or Hinglish words", () => {
  const hinglish =
    /\b(bhai|yaar|hai|hain|kya|bas|nahi|nahin|kar|karo|tera|teri|tere|tujhe|tu|chal|chalo|hoon|ho|paisa|paise|kharcha|dekh|matlab|abhi|kuch|sirf|aaj|toh|bhi|ye|yeh|wala|accha|acha|arre|boss|beta|dikhao|khatam|shuru|sahi|galti|mat)\b/i;
  for (const line of all) assert.ok(!hinglish.test(line), `Hinglish: ${line}`);
});

test("safe roasts: no em dash, nothing about family, looks, identity or income, no swearing, no shaming", () => {
  const banned =
    /—|\b(papa|mummy|mom|dad|parents?|family|caste|religion|gender|your looks|ugly|fat|income|salary|stipend|broke|poor|poorer|cheap|idiot|stupid|dumb|loser|damn|hell|bro)\b/i;
  for (const line of all) assert.ok(!banned.test(line), `bad line: ${line}`);
});

test("short: about 110 characters and at most 4 short sentences (only the founder's own examples use more than 2), once filled in", () => {
  for (const line of all) {
    const text = buddy.fill(line, SAMPLE);
    assert.ok(text.length <= 115, `too long (${text.length}): ${text}`);
    assert.ok((text.match(/[.!?](\s|$)/g) ?? []).length <= 4, `too many sentences: ${text}`);
    assert.ok(!text.includes("{"), `unknown placeholder: ${line}`);
  }
});

test("every trigger has at least 3 versions, no repeats", () => {
  for (const g of groups) {
    assert.ok(g.length >= 3, `needs 3+ versions: ${g[0]}`);
    assert.equal(new Set(g).size, g.length, `repeats in: ${g[0]}`);
  }
  for (const [kind, def] of Object.entries(buddy.EVENTS)) assert.ok(def.lines.length >= 3, kind);
  assert.ok(all.length > 250);
});
