import assert from "node:assert/strict";
import test from "node:test";
import { MAP_W, layoutMap, type SlotKind } from "./map-layout";

const kinds: SlotKind[] = ["start", "banner", "stop", "stop", "stop", "banner", "stop", "stop"];

test("the road climbs: every slot is above the one before, the summit on top", () => {
  const map = layoutMap(kinds);
  for (let i = 1; i < map.points.length; i++) assert.ok(map.points[i].y < map.points[i - 1].y);
  assert.ok(map.summit.y < map.points[map.points.length - 1].y);
  assert.ok(map.points[0].y < map.height);
});

test("the road stays inside the map, away from the edges", () => {
  for (const p of layoutMap(kinds).points) assert.ok(p.x >= 100 && p.x <= 260, `x=${p.x}`);
  assert.equal(MAP_W, 360);
});

test("distances along the road only grow, and end at the summit", () => {
  const map = layoutMap(kinds);
  for (let i = 1; i < map.lengths.length; i++) assert.ok(map.lengths[i] > map.lengths[i - 1]);
  assert.ok(map.summitLength > map.lengths[map.lengths.length - 1]);
  assert.equal(map.total, map.summitLength);
  assert.match(map.d, /^M\d/);
  assert.equal(map.d.split("C").length - 1, kinds.length + 1);
});
