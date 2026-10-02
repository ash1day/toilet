const EARTH_RADIUS_M = 6371008.8;
const RAD = Math.PI / 180;

/**
 * 基準点まわりの局所的な正距円筒図法。緯度経度 ⇔ 基準点からの東西・南北距離(m)。
 * 市町村程度の範囲なら距離・円の歪みは無視できる。
 */
export function localProjection(origin) {
  const metersPerDegLat = EARTH_RADIUS_M * RAD;
  const metersPerDegLng = metersPerDegLat * Math.cos(origin.lat * RAD);
  return {
    project: ({ lat, lng }) => [(lng - origin.lng) * metersPerDegLng, (lat - origin.lat) * metersPerDegLat],
    unproject: ([x, y]) => ({ lat: origin.lat + y / metersPerDegLat, lng: origin.lng + x / metersPerDegLng }),
  };
}
