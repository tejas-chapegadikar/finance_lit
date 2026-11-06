import { test } from "node:test";
import assert from "node:assert/strict";
import { ASSETS, findAsset, monthlyReturn, portfolioShape, simulateMonth, type Holding } from "./sim";

test("safe options grow by exactly their rate each month", () => {
  assert.equal(monthlyReturn(findAsset("savings")!, "seed", 1), 0.03 / 12);
  assert.equal(monthlyReturn(findAsset("fd")!, "seed", 7), 0.065 / 12);
});

test("the same seed and month always give the same result (no faking, no flicker)", () => {
  const nifty = findAsset("nifty")!;
  assert.equal(monthlyReturn(nifty, "p1:1", 5), monthlyReturn(nifty, "p1:1", 5));
  assert.notEqual(monthlyReturn(nifty, "p1:1", 5), monthlyReturn(nifty, "p1:1", 6));
});

test("over many simulated years, each asset averages close to its assumed return", () => {
  for (const asset of ASSETS.filter((a) => a.sigma > 0)) {
    let growth = 0;
    const months = 12 * 400;
    for (let m = 1; m <= months; m++) growth += Math.log(1 + monthlyReturn(asset, "long-run", m));
    const yearly = Math.exp((growth / months) * 12) - 1;
    // Geometric average sits a little under mu; allow simulation noise.
    assert.ok(Math.abs(yearly - asset.mu) < 0.03, `${asset.id}: ${yearly.toFixed(3)} vs ${asset.mu}`);
  }
});

test("riskier assets swing more", () => {
  const spread = (id: string) => {
    const r = Array.from({ length: 600 }, (_, m) => monthlyReturn(findAsset(id)!, "swing", m + 1));
    const mean = r.reduce((a, b) => a + b, 0) / r.length;
    return Math.sqrt(r.reduce((a, b) => a + (b - mean) ** 2, 0) / r.length);
  };
  assert.ok(spread("stock") > spread("midcap") && spread("midcap") > spread("nifty"));
});

test("a month moves holdings, never below zero, and cash stays put", () => {
  const holdings: Holding[] = [
    { asset: "stock", invested: 50000, value: 50000 },
    { asset: "fd", invested: 20000, value: 20000 },
  ];
  const r = simulateMonth(holdings, 30000, "p:1", 1);
  assert.equal(r.totalBefore, 100000);
  assert.ok(r.holdings.every((h) => h.value >= 0));
  assert.ok(Math.abs(r.holdings[1].value - 20000 * (1 + 0.065 / 12)) < 1e-6);
  assert.ok(Math.abs(r.totalAfter - (30000 + r.holdings[0].value + r.holdings[1].value)) < 1e-6);
});

test("portfolio shape: all-in on one stock vs spread out", () => {
  assert.equal(portfolioShape([{ asset: "stock", invested: 90000, value: 90000 }], 10000).allInStock, true);
  const spread: Holding[] = [
    { asset: "nifty", invested: 40000, value: 40000 },
    { asset: "gold", invested: 20000, value: 20000 },
    { asset: "fd", invested: 30000, value: 30000 },
  ];
  assert.deepEqual(portfolioShape(spread, 10000), { allInStock: false, diversified: true });
});
