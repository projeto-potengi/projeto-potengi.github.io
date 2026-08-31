import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createResourceCache } from "../src/lib/webgis-resource-cache.ts";

test("deduplica solicitações simultâneas e preserva o resultado no cache", async () => {
  let calls = 0;
  const cache = createResourceCache(async (id) => {
    calls += 1;
    await Promise.resolve();
    return { id };
  });

  const first = cache.load("rios");
  const simultaneous = cache.load("rios");
  assert.equal(first, simultaneous);
  assert.deepEqual(await first, { id: "rios" });
  assert.deepEqual(await cache.load("rios"), { id: "rios" });
  assert.equal(calls, 1, "desligar e reativar deve reutilizar a carga resolvida");
});

test("a abertura usa somente as cinco camadas da composição Diagnóstico ambiental", async () => {
  const catalog = JSON.parse(await readFile(new URL("../public/data/webgis/camadas-webgis.json", import.meta.url)));
  const source = await readFile(new URL("../src/components/WebGIS.tsx", import.meta.url), "utf8");
  const layers = catalog.grupos.flatMap((group) => group.camadas);
  assert.equal(layers.length, 42);
  assert.match(source, /diagnostic:\s*\{[^}]*layerIds:\s*\[[^\]]+\]/);
  assert.match(source, /initialLayerIds\.has\(layer\.id\)/);
  const diagnosticMatch = source.match(/diagnostic:\s*\{[^}]*layerIds:\s*\[([^\]]+)\]/);
  assert.equal((diagnosticMatch?.[1].match(/"[^"]+"/g) ?? []).length, 5);
  assert.doesNotMatch(source, /Visão geral|overview:/);
  assert.doesNotMatch(source, /layers\.filter\(\(layer\) => layer\.visivel\)/);
});

test("a troca de mapa-base não percorre nem reconstrói camadas vetoriais", async () => {
  const source = await readFile(new URL("../src/components/WebGIS.tsx", import.meta.url), "utf8");
  assert.match(source, /layer\.setSource\(baseSources\.current\[baseMap\]\)/);
  assert.doesNotMatch(source, /\[baseMap\][\s\S]{0,300}new VectorLayer/);
  assert.match(source, /baseMap === "none"\) layer\.setVisible\(false\)/);
});

test("a busca usa índice leve e não carrega as 42 geometrias", async () => {
  const source = await readFile(new URL("../src/components/WebGIS.tsx", import.meta.url), "utf8");
  assert.match(source, /indice-busca\.json/);
  assert.doesNotMatch(source, /Promise\.allSettled\(layers\.map\(\(layer\) => loadLayer/);
});

test("pointermove não atualiza estado React e consulta usa somente índices vetoriais elegíveis", async () => {
  const source = await readFile(new URL("../src/components/WebGIS.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /setCoordinates/);
  assert.match(source, /coordinatesElement\.current\.textContent/);
  assert.match(source, /getFeaturesAtCoordinate\(event\.coordinate\)/);
  assert.match(source, /nonInteractiveReferenceLayers\.has\(id\)/);
});

test("polígonos pesados usam derivados multiescala sem substituir os originais", async () => {
  const source = await readFile(new URL("../src/components/WebGIS.tsx", import.meta.url), "utf8");
  const original = await readFile(new URL("../public/data/webgis/vulnerabilidade.geojson", import.meta.url));
  const general = await readFile(new URL("../public/data/webgis/vulnerabilidade-geral.geojson", import.meta.url));
  const raster = await readFile(new URL("../public/data/webgis/vulnerabilidade-geral.png", import.meta.url));
  const metadata = JSON.parse(await readFile(new URL("../public/data/webgis/vulnerabilidade-geral-raster.json", import.meta.url)));
  assert.match(source, /\$\{id\}-\$\{suffix\}-raster\.json/);
  assert.match(source, /new ImageStatic/);
  assert.ok(general.byteLength < original.byteLength);
  assert.ok(raster.byteLength < general.byteLength);
  assert.equal(metadata.featureCount, 5);
  assert.equal(metadata.extent.length, 4);
  assert.ok(metadata.symbology);
  assert.ok(original.byteLength > 0);
});

test("simbologia compartilhada alimenta mapa, menu, legenda e exportação", async () => {
  const source = await readFile(new URL("../src/components/WebGIS.tsx", import.meta.url), "utf8");
  const symbology = JSON.parse(await readFile(new URL("../public/data/webgis/simbologia-webgis.json", import.meta.url)));
  for (const id of ["uso-solo", "vegetacao", "geologia", "geomorfologia", "pedologia", "aquiferos"]) assert.ok(symbology.layers[id].items.length > 1, `${id} deve possuir categorias`);
  assert.match(source, /function symbologyFor/);
  assert.match(source, /<LayerSymbol layer=\{layer\}/);
  assert.match(source, /const descriptor = symbologyFor\(layer\)/);
  assert.doesNotMatch(source, /FUNPEC|Visão geral/);
});

test("dados tabulares são derivados por camada sem geometria", async () => {
  const table = JSON.parse(await readFile(new URL("../public/data/webgis/tabelas/uso-solo.json", import.meta.url)));
  assert.equal(table.layerId, "uso-solo");
  assert.ok(table.rows.length > 0);
  assert.ok(table.rows.every((row) => !Object.hasOwn(row, "geometry") && !Object.hasOwn(row, "geometria")));
});

test("ordenação e limpeza alteram visibilidade e z-index sem reconstruir fontes", async () => {
  const source = await readFile(new URL("../src/components/WebGIS.tsx", import.meta.url), "utf8");
  assert.match(source, /setZIndex\(zIndex\)/);
  assert.match(source, /const clearLayers = useCallback/);
  assert.match(source, /const moveActiveLayer = useCallback/);
  assert.doesNotMatch(source, /moveActiveLayer[\s\S]{0,500}new VectorSource/);
});
