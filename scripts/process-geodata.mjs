import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import JSZip from "jszip";
import proj4 from "proj4";
import shp from "shpjs";

const root = process.cwd();
const catalogPath = path.join(root, "data", "geospatial", "catalog.json");
const originalsDir = path.join(root, "data", "geospatial", "originals");
const outputDir = path.join(root, "public", "data", "geospatial");

const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
await fs.mkdir(outputDir, { recursive: true });

proj4.defs(
  "EPSG:31985",
  "+proj=utm +zone=25 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);

function normalizeFeatureCollection(result) {
  if (Array.isArray(result)) {
    return {
      type: "FeatureCollection",
      features: result.flatMap((entry) => entry.features ?? [])
    };
  }
  return result;
}

function firstCoordinate(coordinates) {
  let cursor = coordinates;
  while (Array.isArray(cursor?.[0])) cursor = cursor[0];
  return cursor;
}

function mapCoordinates(coordinates, transform) {
  if (!Array.isArray(coordinates?.[0])) return transform(coordinates);
  return coordinates.map((item) => mapCoordinates(item, transform));
}

function reprojectMetricCoordinates(geojson) {
  const sample = firstCoordinate(geojson.features?.[0]?.geometry?.coordinates);
  if (!sample || Math.abs(sample[0]) <= 180) return geojson;
  return {
    ...geojson,
    features: geojson.features.map((feature) => ({
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: mapCoordinates(feature.geometry.coordinates, (coordinate) => proj4("EPSG:31985", "EPSG:4326", coordinate))
      }
    }))
  };
}

for (const layer of catalog.layers) {
  const layerDir = path.join(originalsDir, layer.name);
  const zip = new JSZip();
  let hasRequiredCore = true;

  for (const [extension] of Object.entries(layer.files)) {
    const filePath = path.join(layerDir, `${layer.name}.${extension}`);
    try {
      const data = await fs.readFile(filePath);
      zip.file(`${layer.name}.${extension}`, data);
    } catch {
      hasRequiredCore = false;
      console.warn(`Pendente: ${layer.name}.${extension}`);
    }
  }

  if (!hasRequiredCore) {
    continue;
  }

  try {
    const arrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
    const geojson = reprojectMetricCoordinates(normalizeFeatureCollection(await shp(arrayBuffer)));
    if (!geojson?.features?.length) {
      console.warn(`Sem feicoes: ${layer.name}`);
      continue;
    }
    await fs.writeFile(path.join(outputDir, layer.output), JSON.stringify(geojson), "utf8");
    console.log(`${layer.title}: ${geojson.features.length} feicoes`);
  } catch (error) {
    console.warn(`Falha ao processar ${layer.name}: ${error.message}`);
  }
}
