import { computeDangerZones } from "./dangerZones.js";
import { localProjection } from "./projection.js";

const DANGER_COLOR = "#e74c3c";

const toilets = await fetch("data/toilets.json").then((res) => {
  if (!res.ok) throw new Error(`data/toilets.json: HTTP ${res.status}`);
  return res.json();
});

const map = L.map("map");
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
map.fitBounds(L.latLngBounds(toilets.map(({ lat, lng }) => [lat, lng])), { padding: [20, 20] });

// 危険地帯: トイレから遠い場所ほど大きな円になる
map.createPane("danger");
const dangerRenderer = L.svg({ pane: "danger" });
const center = map.getCenter();
const { project, unproject } = localProjection({ lat: center.lat, lng: center.lng });
for (const zone of computeDangerZones(toilets.map(project))) {
  L.circle(unproject([zone.x, zone.y]), {
    radius: zone.r,
    renderer: dangerRenderer,
    stroke: false,
    fillColor: DANGER_COLOR,
    fillOpacity: 1,
    interactive: false,
  }).addTo(map);
}

const toiletIcon = L.icon({ iconUrl: "toilet.svg", iconSize: [48, 48], className: "toilet-icon" });
for (const { name, lat, lng } of toilets) {
  L.marker([lat, lng], { icon: toiletIcon, title: name }).bindPopup(name).addTo(map);
}
