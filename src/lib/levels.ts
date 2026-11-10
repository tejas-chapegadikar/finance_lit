// XP levels: worked out from lifetime XP, so nothing extra is stored and
// nobody's progress changes. Level n starts at 50 x n x (n - 1) XP, which
// means 100 XP to level 2, 300 to level 3, 600 to level 4, and so on.

export type LevelProgress = { level: number; into: number; span: number; toNext: number; percent: number };

export const xpForLevel = (level: number) => 50 * level * (level - 1);

export function levelFor(xp: number): LevelProgress {
  const safe = Math.max(0, Math.floor(xp));
  let level = 1;
  while (xpForLevel(level + 1) <= safe) level++;
  const start = xpForLevel(level);
  const span = xpForLevel(level + 1) - start;
  const into = safe - start;
  return { level, into, span, toNext: span - into, percent: Math.floor((into / span) * 100) };
}
