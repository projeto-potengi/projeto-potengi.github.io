import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import GeoJSON from "ol/format/GeoJSON.js";
import { fromLonLat } from "ol/proj.js";
import sharp from "sharp";

const dataRoot = path.join(process.cwd(), "public", "data", "webgis");
const targets = ["vulnerabilidade", "uso-solo", "app-hidrografia", "app-rios"];
const format = new GeoJSON();
const symbology = JSON.parse(await readFile(path.join(dataRoot, "simbologia-webgis.json"), "utf8"));

function fillFor(id, feature) {
  const descriptor = symbology.layers[id];
  const value = descriptor.field ? feature.get(descriptor.field) : undefined;
  return descriptor.items?.find((item) => String(item.value) === String(value))?.color
    ?? descriptor.fill ?? descriptor.stroke ?? "#4d7c0f";
}

function ringsForGeometry(geometry) {
  if (geometry.getType() === "Polygon") return geometry.getCoordinates();
  if (geometry.getType() === "MultiPolygon") return geometry.getCoordinates().flat();
  return [];
}

async function writeScaleRaster(id, suffix, features) {
  const projected = features.map((feature) => ({
    color: fillFor(id, feature),
    rings: ringsForGeometry(feature.getGeometry()).map((ring) => ring.map((coordinate) => fromLonLat(coordinate)))
  }));
  const coordinates = projected.flatMap((feature) => feature.rings.flat());
  const extent = coordinates.reduce((bounds, coordinate) => [
    Math.min(bounds[0], coordinate[0]), Math.min(bounds[1], coordinate[1]),
    Math.max(bounds[2], coordinate[0]), Math.max(bounds[3], coordinate[1])
  ], [Infinity, Infinity, -Infinity, -Infinity]);
  const width = 2048;
  const height = Math.max(512, Math.round(width * (extent[3] - extent[1]) / (extent[2] - extent[0])));
  const pathForRing = (ring) => ring.map((coordinate, index) => {
    const x = ((coordinate[0] - extent[0]) / (extent[2] - extent[0]) * width).toFixed(1);
    const y = ((extent[3] - coordinate[1]) / (extent[3] - extent[1]) * height).toFixed(1);
    return `${index ? "L" : "M"}${x} ${y}`;
  }).join("") + "Z";
  const paths = projected.map(({ color, rings }) => `<path d="${rings.map(pathForRing).join("")}" fill="${color}" fill-rule="evenodd"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${paths}</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(path.join(dataRoot, `${id}-${suffix}.png`));
  await writeFile(path.join(dataRoot, `${id}-${suffix}-raster.json`), `${JSON.stringify({ extent, featureCount: features.length, width, height, symbology: symbology.layers[id] })}\n`);
}

for (const id of targets) {
  const input = JSON.parse(await readFile(path.join(dataRoot, `${id}.geojson`), "utf8"));
  const features = format.readFeatures(input);
  for (const [suffix, tolerance] of [["geral", 0.005], ["intermediario", 0.001]]) {
    const derived = features.map((feature) => {
      const clone = feature.clone();
      const geometry = feature.getGeometry();
      if (geometry) clone.setGeometry(geometry.simplify(tolerance));
      clone.setId(feature.getId());
      return clone;
    });
    const output = format.writeFeaturesObject(derived, { decimals: 6 });
    await writeFile(path.join(dataRoot, `${id}-${suffix}.geojson`), `${JSON.stringify(output)}\n`);
    await writeScaleRaster(id, suffix, derived);
  }
}

console.log(`Derivados multiescala WebGIS: ${targets.length * 6} arquivos; originais preservados.`);
