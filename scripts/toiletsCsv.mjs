/** RFC 4180 形式の CSV を行×列の文字列配列にする */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** 公共トイレデータの CSV 行から {name, lat, lng} の配列を作る */
export function toToilets([header, ...records]) {
  const column = (name) => {
    const index = header.indexOf(name);
    if (index === -1) throw new Error(`CSV に「${name}」列がありません`);
    return index;
  };
  const nameCol = column("施設名");
  const latCol = column("緯度");
  const lngCol = column("経度");
  return records
    .filter((record) => record[latCol]?.trim() && record[lngCol]?.trim())
    .map((record) => ({
      name: record[nameCol],
      lat: Number(record[latCol]),
      lng: Number(record[lngCol]),
    }))
    .filter(({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng));
}
