// The Learn map's geometry: a winding road that climbs from the start house
// (bottom) to the summit (top), with one point per slot (the start, each
// level's sign, each stop). Pure, so it's tested (map-layout.test.ts) and runs
// the same on the server and in the browser. Units are the SVG viewBox's.

export const MAP_W = 360;
export type SlotKind = "start" | "banner" | "stop";
export type MapPoint = { x: number; y: number };

const BOTTOM = 70; // from the start house to the bottom edge
const TOP = 150; // room for the summit at the top
// The gap above a slot, by its kind.
const GAP: Record<SlotKind, number> = { start: 96, banner: 92, stop: 100 };

export type MapLayout = {
  height: number;
  points: MapPoint[];
  summit: MapPoint;
  /** The road as an SVG path, from the bottom edge to the summit. */
  d: string;
  /** Distance along the road to each slot's point, and to the summit. */
  lengths: number[];
  summitLength: number;
  total: number;
};

const roadX = (i: number) => Math.round(180 + 74 * Math.sin(i * 0.82 + 0.4));

function cubicLength(p0: MapPoint, c1: MapPoint, c2: MapPoint, p1: MapPoint) {
  let length = 0;
  let prev = p0;
  for (let s = 1; s <= 24; s++) {
    const t = s / 24;
    const u = 1 - t;
    const pt = {
      x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
      y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
    };
    length += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    prev = pt;
  }
  return length;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function layoutMap(kinds: SlotKind[]): MapLayout {
  const climb = kinds.slice(0, -1).reduce((sum, k) => sum + GAP[k], 0);
  const height = BOTTOM + climb + TOP;
  let y = height - BOTTOM;
  const points = kinds.map((kind, i) => {
    const point = { x: roadX(i), y };
    y -= GAP[kind];
    return point;
  });
  const summit = { x: 180, y: 78 };
  // The road enters from the bottom edge, passes every point, and ends at the summit.
  const route = [{ x: points[0]?.x ?? 180, y: height + 12 }, ...points, summit];
  let d = `M${route[0].x} ${route[0].y}`;
  const cumulative = [0];
  for (let i = 0; i < route.length - 1; i++) {
    const p0 = route[Math.max(0, i - 1)];
    const p1 = route[i];
    const p2 = route[i + 1];
    const p3 = route[Math.min(route.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${p2.x} ${p2.y}`;
    cumulative.push(cumulative[i] + cubicLength(p1, c1, c2, p2));
  }
  return {
    height,
    points,
    summit,
    d,
    lengths: points.map((_, i) => r1(cumulative[i + 1])),
    summitLength: r1(cumulative[cumulative.length - 1]),
    total: r1(cumulative[cumulative.length - 1]),
  };
}
