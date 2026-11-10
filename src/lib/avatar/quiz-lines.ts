// The avatar's reactions to quiz answers. Teases what you know, never who you
// are. Picked from a seed (the question's text) so server and browser agree.

const RIGHT = [
  "Correct. I'm as shocked as you are.",
  "Right! Was that knowledge or luck? Don't answer.",
  "Correct. Your parents would be mildly impressed.",
  "Yes! Write this date down.",
  "Correct. Don't let it go to your head.",
  "Look at you, knowing things.",
];

const WRONG = [
  "Nope. Bold guess, though.",
  "Wrong. Confidently wrong, which is the expensive kind.",
  "Not even close. This is why we're here.",
  "Nope. Your bank was hoping you'd say that.",
  "Wrong, and a banker somewhere just smiled.",
  "That's a no. Read this bit slowly.",
];

function seedOf(text: string) {
  let n = 0;
  for (const ch of text) n = (n * 31 + ch.charCodeAt(0)) % 9973;
  return n;
}

export const rightLine = (seed: string) => RIGHT[seedOf(seed) % RIGHT.length];
export const wrongLine = (seed: string) => WRONG[seedOf(seed) % WRONG.length];

/** A verdict on a whole quiz, from its accuracy out of 100. */
export function verdictFor(accuracy: number) {
  if (accuracy >= 100) return "Full marks. Suspicious, but well done.";
  if (accuracy >= 80) return "Pretty good. You almost seem like you know about money.";
  if (accuracy >= 60) return "Passable. Like your attendance.";
  return "Well, that was rough. Good thing it wasn't real money this time.";
}
