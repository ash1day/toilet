import { test } from "node:test";
import assert from "node:assert/strict";
import { computeDangerZones } from "../src/dangerZones.js";

test("母点が3点未満のときは危険地帯なし", () => {
  assert.deepEqual(computeDangerZones([]), []);
  assert.deepEqual(computeDangerZones([[0, 0], [10, 0]]), []);
});

test("正三角形の3母点では外心に、外接円半径の半分の円ができる", () => {
  const R = 10;
  const points = [90, 210, 330].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return [R * Math.cos(rad), R * Math.sin(rad)];
  });
  const zones = computeDangerZones(points);
  assert.equal(zones.length, 1);
  assert.ok(Math.abs(zones[0].x) < 1e-9);
  assert.ok(Math.abs(zones[0].y) < 1e-9);
  assert.ok(Math.abs(zones[0].r - R / 2) < 1e-9);
});

test("外心が母点の存在範囲より外にある場合は描かない", () => {
  // 鈍角三角形の外心は (5, -12) で、母点の y 範囲 [0, 1] の外になる
  assert.deepEqual(computeDangerZones([[0, 0], [10, 0], [5, 1]]), []);
});

test("トイレが密集していて半径が0以下になる円は描かない", () => {
  const sparse = [[0, 0], [100, 0], [0, 100], [100, 100]];
  const dense = [[50, 50], [51, 50], [50, 51]];
  const zones = computeDangerZones([...sparse, ...dense]);
  assert.ok(zones.length > 0);
  assert.ok(zones.every((z) => z.r > 0));
});
