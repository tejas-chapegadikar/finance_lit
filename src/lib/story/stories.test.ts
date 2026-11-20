import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_1_LESSONS } from "../../../prisma/content/level1";
import { loansEmis } from "../../../prisma/content/loans";
import { INVEST_LESSONS } from "../../../prisma/content/investsmart";
import { FACES } from "../../components/story/characters";
import { CAMERA, type Story } from "./types";
import { STORY_SLUGS, loadStory } from "./registry";

// Every lesson's scroll story, checked against the real lesson and quiz:
// every quiz question is taught by a scene, stories stay crisp (≤ 8 scenes,
// captions ≤ 10 words), steps only touch real actors, amounts use Indian
// commas, and no two stories share a cast, relationship or setting.

const lessons = [...new Map([...LEVEL_1_LESSONS, loansEmis, ...INVEST_LESSONS].map((l) => [l.slug, l])).values()];
const norm = (s: string) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
const words = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

async function all(): Promise<Story[]> {
  return Promise.all(STORY_SLUGS.map(async (slug) => (await loadStory(slug))!));
}

test("every lesson has a story", () => {
  const missing = lessons.filter((l) => !STORY_SLUGS.includes(l.slug)).map((l) => l.slug);
  assert.deepEqual(missing, []);
});

test("each story teaches every quiz question of its lesson, in a real scene", async () => {
  for (const story of await all()) {
    const lesson = lessons.find((l) => l.slug === story.slug);
    assert.ok(lesson, `${story.slug}: no such lesson`);
    assert.ok(story.meta, `${story.slug}: no meta`);
    const quiz = lesson.questions.map((q) => norm(q.prompt)).sort();
    const covered = story.meta.coverage.map((c) => norm(c.q)).sort();
    assert.deepEqual(covered, quiz, `${story.slug}: coverage must list exactly its quiz questions`);
    for (const c of story.meta.coverage) {
      assert.ok(c.scene >= 1 && c.scene < story.scenes.length, `${story.slug}: scene ${c.scene} for "${c.q.slice(0, 40)}"`);
      assert.ok(c.how.length > 20, `${story.slug}: explain how scene ${c.scene} teaches it`);
    }
  }
});

test("stories are crisp: at most 8 scenes, captions of at most 10 words, a 3-card recap last", async () => {
  for (const story of await all()) {
    assert.ok(story.scenes.length <= 8, `${story.slug}: ${story.scenes.length} scenes`);
    for (const scene of story.scenes) {
      assert.ok(words(scene.caption) <= 10, `${story.slug}: "${scene.caption}" has ${words(scene.caption)} words`);
      assert.ok(!/—/.test(scene.caption), `${story.slug}: em dash in "${scene.caption}"`);
    }
    const cards = story.actors.filter((a) => a.kind === "card");
    assert.equal(cards.length, 3, `${story.slug}: recap needs 3 cards`);
    const last = story.scenes[story.scenes.length - 1];
    for (const card of cards)
      assert.ok(
        last.steps.some((s) => s.actor === card.id),
        `${story.slug}: recap card ${card.id} isn't in the last scene`,
      );
  }
});

test("every step touches a real actor, with a real face", async () => {
  const faces = new Set<string>(FACES);
  for (const story of await all()) {
    const ids = new Set(story.actors.map((a) => a.id));
    assert.equal(ids.size, story.actors.length, `${story.slug}: duplicate actor ids`);
    for (const [i, scene] of story.scenes.entries()) {
      for (const step of scene.steps) {
        assert.ok(ids.has(step.actor) || step.actor === CAMERA, `${story.slug} scene ${i + 1}: unknown actor ${step.actor}`);
        assert.ok(step.at >= 0 && step.at <= 1, `${story.slug} scene ${i + 1}: step time ${step.at}`);
        if ("layer" in step) {
          const face = step.layer.match(/face:(\w+)/)?.[1];
          if (face) assert.ok(faces.has(face), `${story.slug}: unknown face ${face}`);
        }
      }
    }
  }
});

test("rupee amounts use Indian commas everywhere a reader sees them", async () => {
  for (const story of await all()) {
    const texts = [
      ...story.scenes.map((s) => s.caption),
      ...story.actors.flatMap((a) => Object.values(a.props ?? {}).filter((v): v is string => typeof v === "string")),
    ];
    for (const t of texts) assert.ok(!/₹\d{4,}/.test(t), `${story.slug}: "${t}" needs commas`);
  }
});

test("no two stories share a cast, relationship, setting or title", async () => {
  const stories = await all();
  for (const key of ["cast", "relationship", "setting", "title"] as const) {
    const values = stories.map((s) => norm(s.meta![key]).toLowerCase());
    assert.equal(new Set(values).size, values.length, `${key} repeats: ${values.join(" | ")}`);
  }
  const backdrops = stories.map((s) => s.backdrop?.place);
  assert.equal(new Set(backdrops).size, backdrops.length, `backdrops repeat: ${backdrops.join(", ")}`);
});
