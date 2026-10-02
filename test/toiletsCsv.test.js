import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, toToilets } from "../scripts/toiletsCsv.mjs";

test("クォートあり・なしの値が混在した行をパースできる", () => {
  assert.deepEqual(parseCsv('a,b,c\n東公園,"",35.9\n'), [
    ["a", "b", "c"],
    ["東公園", "", "35.9"],
  ]);
});

test("クォート内のカンマ・改行・エスケープされた引用符、CRLF改行を扱える", () => {
  assert.deepEqual(parseCsv('name,note\r\n"A,B","1行目\n2行目 ""引用"""\r\n'), [
    ["name", "note"],
    ["A,B", '1行目\n2行目 "引用"'],
  ]);
});

test("ヘッダの列名から施設名・緯度・経度を取り出す（重複した列名があっても良い）", () => {
  const rows = [
    ["施設名", "施設名(英語)", "緯度", "経度", "画像URL", "画像URL"],
    ["東公園", "Higashi Park", "35.943774", "136.198962", "", ""],
  ];
  assert.deepEqual(toToilets(rows), [{ name: "東公園", lat: 35.943774, lng: 136.198962 }]);
});

test("緯度・経度が空や数値でない行は除外する", () => {
  const rows = [
    ["施設名", "緯度", "経度"],
    ["座標なし", "", ""],
    ["壊れた座標", "北緯", "東経"],
    ["東公園", "35.943774", "136.198962"],
  ];
  assert.deepEqual(toToilets(rows).map((t) => t.name), ["東公園"]);
});
