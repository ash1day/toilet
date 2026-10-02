import { test } from "node:test";
import assert from "node:assert/strict";
import { localProjection } from "../src/projection.js";

const near = (a, b, eps) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test("基準点は原点に写る", () => {
  const { project } = localProjection({ lat: 35.95, lng: 136.18 });
  const [x, y] = project({ lat: 35.95, lng: 136.18 });
  near(x, 0, 1e-9);
  near(y, 0, 1e-9);
});

test("北へ緯度0.01度・東へ経度0.01度進むと、それぞれ約1.11kmと約0.90km（北緯35.95度）", () => {
  const { project } = localProjection({ lat: 35.95, lng: 136.18 });
  const [, north] = project({ lat: 35.96, lng: 136.18 });
  const [east] = project({ lat: 35.95, lng: 136.19 });
  near(north, 1112, 2);
  near(east, 901, 2);
});

test("unproject は project の逆変換", () => {
  const { project, unproject } = localProjection({ lat: 35.95, lng: 136.18 });
  const p = { lat: 35.9926, lng: 136.1766 };
  const back = unproject(project(p));
  near(back.lat, p.lat, 1e-12);
  near(back.lng, p.lng, 1e-12);
});
