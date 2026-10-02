// 鯖江市「公共トイレ」オープンデータ (CC BY 2.1) を取得して data/toilets.json に保存する。
// 配信元は CORS 非対応なので、ブラウザから直接読まずにこのスクリプトで静的ファイル化する。
import { writeFile } from "node:fs/promises";
import { parseCsv, toToilets } from "./toiletsCsv.mjs";

const SOURCE_URL = "https://data.odp.jig.jp/viewcsv/jp/fukui/sabae/202.csv";
const OUTPUT = new URL("../data/toilets.json", import.meta.url);

const res = await fetch(SOURCE_URL);
if (!res.ok) throw new Error(`${SOURCE_URL}: HTTP ${res.status}`);
const text = new TextDecoder("shift_jis").decode(await res.arrayBuffer());
const toilets = toToilets(parseCsv(text));

await writeFile(OUTPUT, JSON.stringify(toilets, null, 2) + "\n");
console.log(`${toilets.length} 件のトイレを ${OUTPUT.pathname} に保存しました`);
