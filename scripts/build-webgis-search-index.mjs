import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const dataRoot = path.join(projectRoot, "public", "data", "webgis");
const catalog = JSON.parse(await readFile(path.join(dataRoot, "camadas-webgis.json"), "utf8"));

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function titleFor(properties, layer) {
  for (const field of [layer.rotulo, "nome", "municipio", "area_atuacao", "elemento", "unidade", "classe", "tipo"]) {
    if (field && properties[field]) return String(properties[field]);
  }
  return layer.titulo;
}

const entries = [];
for (const group of catalog.grupos) {
  for (const layer of group.camadas) {
    const collection = JSON.parse(await readFile(path.join(dataRoot, layer.arquivo), "utf8"));
    collection.features.forEach((feature, featureIndex) => {
      const properties = feature.properties ?? {};
      const attributes = layer.camposConsulta.flatMap((key) => {
        const value = properties[key];
        return value === null || value === undefined || String(value).trim() === "" ? [] : [{ key, value }];
      });
      const searchable = attributes.map(({ value }) => value).join(" ");
      entries.push({
        id: `${layer.id}-${feature.id ?? featureIndex}`,
        layerId: layer.id,
        featureIndex,
        title: titleFor(properties, layer),
        municipality: properties.municipio ? String(properties.municipio) : undefined,
        searchText: normalize(searchable)
      });
    });
  }
}

const output = {
  version: 1,
  generatedFrom: "camadas-webgis.json",
  layerCount: catalog.totalCamadas,
  entryCount: entries.length,
  entries
};
await writeFile(path.join(dataRoot, "indice-busca.json"), `${JSON.stringify(output)}\n`);
console.log(`Índice WebGIS: ${entries.length} feições em ${catalog.totalCamadas} camadas.`);
