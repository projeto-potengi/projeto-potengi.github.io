import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataRoot = path.join(process.cwd(), "public", "data", "webgis");
const tableRoot = path.join(dataRoot, "tabelas");
const catalog = JSON.parse(await readFile(path.join(dataRoot, "camadas-webgis.json"), "utf8"));
const categoricalPalette = ["#0f766e", "#2563eb", "#7c3aed", "#d97706", "#be185d", "#4d7c0f", "#0369a1", "#b45309"];
const bluePalette = ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#1e3a8a"];
const rasterizedLayers = new Set(["vulnerabilidade", "uso-solo", "app-hidrografia", "app-rios"]);

function hashValue(value) {
  return String(value ?? "").split("").reduce((total, letter) => ((total << 5) - total + letter.charCodeAt(0)) | 0, 0);
}

function colorFor(layer, value) {
  const explicit = layer.classificacao?.itens?.find((item) => String(item.valor) === String(value));
  if (explicit) return explicit.cor;
  const palette = layer.classificacao?.paleta === "sequencial_azul" ? bluePalette : categoricalPalette;
  return palette[Math.abs(hashValue(value)) % palette.length];
}

function featureTitle(properties, layer) {
  for (const field of [layer.rotulo, "nome", "municipio", "area_atuacao", "elemento", "unidade", "classe", "tipo"]) {
    if (field && properties[field] !== undefined && String(properties[field]).trim()) return String(properties[field]);
  }
  return layer.titulo;
}

function visitCoordinates(value, visit) {
  if (!Array.isArray(value)) return;
  if (typeof value[0] === "number" && typeof value[1] === "number") visit(value);
  else value.forEach((item) => visitCoordinates(item, visit));
}

function descriptorFor(layer, collection) {
  const geometry = layer.geometria.includes("Point") ? "point" : layer.geometria.includes("LineString") ? "line" : "polygon";
  if (!layer.classificacao) return {
    type: "single", geometry,
    fill: layer.estilo?.fill, stroke: layer.estilo?.stroke ?? (geometry === "line" ? "#176b9c" : "#315f59"),
    strokeWidth: layer.estilo?.strokeWidth, radius: layer.estilo?.circleRadius, lineDash: layer.estilo?.lineDash
  };
  const values = [...new Set(collection.features.map((feature) => feature.properties?.[layer.classificacao.campo]).filter((value) => value !== null && value !== undefined && String(value).trim()))];
  if (layer.classificacao.paleta === "sequencial_azul") values.sort((a, b) => Number(a) - Number(b));
  else values.sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true }));
  return {
    type: layer.classificacao.paleta === "sequencial_azul"
      ? "continuous"
      : rasterizedLayers.has(layer.id) ? "raster-categorized" : "categorized",
    geometry, field: layer.classificacao.campo,
    items: values.map((value) => {
      const explicit = layer.classificacao.itens?.find((item) => String(item.valor) === String(value));
      return { value, label: explicit?.rotulo ?? String(value), color: colorFor(layer, value) };
    })
  };
}

const recoveryDefinitions = [
  { id: "nascente-potengi", label: "Nascentes do Potengi", layerIds: ["cercamento-nascente", "trilha-nascente"] },
  { id: "acude-eloy", label: "Açude Eloy de Souza", layerIds: ["area-plantio-eloy", "cercamento-eloy", "corredor-ecologico-eloy-area", "corredor-ecologico-eloy-eixo", "porteiras-eloy"] },
  { id: "fazenda-mundo-novo", label: "Fazenda Mundo Novo", layerIds: ["area-mundo-novo"] },
  { id: "eaj", label: "Escola Agrícola de Jundiaí", layerIds: ["recuperacao-eaj", "nucleacao-eaj", "areas-descobertas-eaj", "zoneamento-eaj", "drenagens-eaj"] }
];

await mkdir(tableRoot, { recursive: true });
const symbology = { version: 1, generatedFrom: "camadas-webgis.json", layers: {} };
const collections = {};
for (const group of catalog.grupos) {
  for (const layer of group.camadas) {
    const collection = JSON.parse(await readFile(path.join(dataRoot, layer.arquivo), "utf8"));
    collections[layer.id] = collection;
    symbology.layers[layer.id] = descriptorFor(layer, collection);
    const rows = collection.features.map((feature, featureIndex) => {
      const properties = feature.properties ?? {};
      return {
        id: String(feature.id ?? `${layer.id}-${featureIndex + 1}`), featureIndex,
        title: featureTitle(properties, layer),
        values: Object.fromEntries(layer.camposConsulta.flatMap((field) => {
          const value = properties[field];
          return value === null || value === undefined || String(value).trim() === "" ? [] : [[field, value]];
        }))
      };
    });
    await writeFile(path.join(tableRoot, `${layer.id}.json`), `${JSON.stringify({ version: 1, layerId: layer.id, fields: layer.camposConsulta, rows })}\n`);
  }
}

const recoveryLocations = recoveryDefinitions.map((definition) => {
  const extent = [Infinity, Infinity, -Infinity, -Infinity];
  definition.layerIds.forEach((id) => collections[id]?.features.forEach((feature) => visitCoordinates(feature.geometry?.coordinates, ([x, y]) => {
    extent[0] = Math.min(extent[0], x); extent[1] = Math.min(extent[1], y);
    extent[2] = Math.max(extent[2], x); extent[3] = Math.max(extent[3], y);
  })));
  return { ...definition, extent, coordinate: [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2] };
});

await writeFile(path.join(dataRoot, "simbologia-webgis.json"), `${JSON.stringify(symbology)}\n`);
await writeFile(path.join(dataRoot, "locais-recuperacao.json"), `${JSON.stringify({ version: 1, locations: recoveryLocations })}\n`);
console.log(`Artefatos de interface WebGIS: ${Object.keys(symbology.layers).length} simbologias, 42 tabelas e ${recoveryLocations.length} locais.`);
