import { Delaunay } from "d3-delaunay";

// 3点を通る円。中心はボロノイ頂点（3つの母点から等距離＝周囲で最もトイレから遠い点）になる
function circumcircle([ax, ay], [bx, by], [cx, cy]) {
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  const a2 = ax * ax + ay * ay;
  const b2 = bx * bx + by * by;
  const c2 = cx * cx + cy * cy;
  const x = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
  const y = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
  return { x, y, r: Math.hypot(ax - x, ay - y) };
}

function boundsOf(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/**
 * トイレ(母点)の平面座標から「トイレ危険地帯」の円を求める。
 * 各ボロノイ頂点を中心に、半径 = 最寄りトイレまでの距離 - 平均距離/2 の円を返す。
 * トイレが存在する範囲の外にある頂点と、半径が0以下になる円は除く。
 */
export function computeDangerZones(points) {
  if (points.length < 3) return [];
  const { triangles } = Delaunay.from(points);
  const { minX, maxX, minY, maxY } = boundsOf(points);

  const vertices = [];
  for (let i = 0; i < triangles.length; i += 3) {
    const c = circumcircle(points[triangles[i]], points[triangles[i + 1]], points[triangles[i + 2]]);
    if (c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY) vertices.push(c);
  }
  if (vertices.length === 0) return [];

  const average = vertices.reduce((sum, v) => sum + v.r, 0) / vertices.length;
  return vertices
    .map((v) => ({ x: v.x, y: v.y, r: v.r - average / 2 }))
    .filter((v) => v.r > 0);
}
