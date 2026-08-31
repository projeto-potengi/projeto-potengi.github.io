import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

test("rotas institucionais principais existem", () => {
  for (const route of [
    "app/page.tsx",
    "app/projeto/page.tsx",
    "app/resultados/page.tsx",
    "app/webgis/page.tsx",
    "app/mapas/page.tsx",
    "app/registros/page.tsx",
    "app/documentos/page.tsx",
    "app/acervo/page.tsx"
  ]) {
    assert.equal(existsSync(join(root, route)), true, `${route} deve existir`);
  }
});

test("navegação principal usa a estrutura aprovada da Fase 1", () => {
  const project = readFileSync(join(root, "src/data/project.ts"), "utf8");
  const header = readFileSync(join(root, "src/components/SiteHeader.tsx"), "utf8");

  for (const label of ["Início", "Projeto", "Resultados", "WebGIS", "Mapas", "Registros", "Documentos"]) {
    assert.match(project, new RegExp(`label: "${label}"`));
  }

  assert.doesNotMatch(project, /label: "Acervo"|label: "O Projeto"/);
  assert.match(header, /aria-expanded/);
  assert.match(header, /aria-controls="main-navigation"/);
});

test("marca oficial substitui o marcador genérico", () => {
  const header = readFileSync(join(root, "src/components/SiteHeader.tsx"), "utf8");
  const home = readFileSync(join(root, "app/page.tsx"), "utf8");
  assert.match(header, /projeto-potengi-logo\.png/);
  assert.match(home, /projeto-potengi-logo\.png/);
  assert.doesNotMatch(header + home, /brand-mark|>P</);
});

test("WebGIS não expõe mensagens públicas de desenvolvimento", () => {
  const webgis = readFileSync(join(root, "src/components/WebGIS.tsx"), "utf8");
  for (const forbidden of ["GeoJSON pendente", "camada aguardando", "caminho", "fictícia"]) {
    assert.equal(webgis.includes(forbidden), false, `texto público indevido: ${forbidden}`);
  }
});

test("WebGIS integra o contrato único com 42 camadas públicas", () => {
  const catalogPath = join(root, "public/data/webgis/camadas-webgis.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  const layers = catalog.grupos.flatMap((group) => group.camadas);
  const webgis = readFileSync(join(root, "src/components/WebGIS.tsx"), "utf8");

  assert.equal(catalog.totalCamadas, 42);
  assert.equal(catalog.grupos.length, 5);
  assert.equal(layers.length, 42);
  assert.equal(new Set(layers.map((layer) => layer.id)).size, 42);
  assert.equal(new Set(layers.map((layer) => layer.arquivo)).size, 42);
  for (const layer of layers) {
    assert.equal(existsSync(join(root, "public/data/webgis", layer.arquivo)), true, `${layer.arquivo} deve existir`);
    assert.ok(Array.isArray(layer.camposConsulta), `${layer.id} deve definir camposConsulta`);
  }
  assert.match(webgis, /camadas-webgis\.json/);
  assert.match(webgis, /loadPromises/);
  assert.doesNotMatch(webgis, /from "@\/src\/data\/layers"/);
});

test("WebGIS oferece ferramentas cartográficas e exportação real", () => {
  const webgis = readFileSync(join(root, "src/components/WebGIS.tsx"), "utf8");
  for (const required of [
    "Base clara",
    "OpenStreetMap",
    "Satélite",
    "Medir distância",
    "Medir área",
    "Mostrar minha localização",
    "Alternar tela cheia",
    "Exportar mapa em PNG",
    "canvas.toBlob",
    "camposConsulta"
  ]) {
    assert.match(webgis, new RegExp(required));
  }
  assert.doesNotMatch(webgis, /17[,.]05\s*ha/);
});

test("package.json mantém apenas uma dependência proj4", () => {
  const packageText = readFileSync(join(root, "package.json"), "utf8");
  assert.equal((packageText.match(/"proj4"/g) ?? []).length, 1);
});

test("área recuperada oficial fica centralizada em 16,25 ha", () => {
  const project = readFileSync(join(root, "src/data/project.ts"), "utf8");
  const results = readFileSync(join(root, "app/resultados/page.tsx"), "utf8");
  const chart = readFileSync(join(root, "src/components/RecoveryChart.tsx"), "utf8");
  const publicText = project + results + chart;

  assert.match(project, /recoveryTotalHectares/);
  assert.match(project, /formatHectares\(recoveryTotalHectares\)/);
  const deprecatedAreaPattern = new RegExp(["17", "05"].join("[,.]"));
  assert.doesNotMatch(publicText, deprecatedAreaPattern);
});

test("catálogos da Fase 1 usam modelos estáticos próprios", () => {
  const maps = readFileSync(join(root, "src/data/maps.ts"), "utf8");
  const records = readFileSync(join(root, "src/data/records.ts"), "utf8");
  const documents = readFileSync(join(root, "src/data/documents.ts"), "utf8");
  const results = readFileSync(join(root, "app/resultados/page.tsx"), "utf8");
  const archive = readFileSync(join(root, "app/acervo/page.tsx"), "utf8");

  assert.match(maps, /staticMaps/);
  assert.match(records, /records/);
  assert.match(documents, /documents/);
  assert.doesNotMatch(results, /@\/src\/data\/catalog/);
  assert.match(archive, /redirect\("\/documentos"\)/);
});

test("catálogos autoritativos foram incorporados", () => {
  const maps = JSON.parse(readFileSync(join(root, "fontes/fase-2/catalogo_mapas_completude_2026-08-26.json"), "utf8"));
  const records = JSON.parse(readFileSync(join(root, "fontes/completude-2026-08-26/catalogo_registros_completude_2026-08-26.json"), "utf8"));
  const documents = JSON.parse(readFileSync(join(root, "fontes/fase-2/catalogo_documentos_fase2.json"), "utf8"));
  const mapsData = readFileSync(join(root, "src/data/maps.ts"), "utf8");
  const recordsData = readFileSync(join(root, "src/data/records.ts"), "utf8");
  const documentsData = readFileSync(join(root, "src/data/documents.ts"), "utf8");
  const home = readFileSync(join(root, "src/data/catalog.ts"), "utf8");

  assert.equal(maps.items.length, 61);
  assert.equal(maps.items.filter((item) => item.meta.includes(6)).length, 28);
  assert.equal(records.items.length, 18);
  assert.equal(documents.items.length, 19);
  assert.match(mapsData, /catalogo_mapas_completude_2026-08-26\.json/);
  assert.match(recordsData, /catalogo_registros_completude_2026-08-26\.json/);
  assert.match(documentsData, /catalogo_documentos_fase2\.json/);
  assert.match(home, /rio-potengi-encontro-litoral\.jpg/);
});

test("Registros usa a completude editorial fechada com galeria e visualizador próprios", () => {
  const catalog = JSON.parse(readFileSync(join(root, "fontes/completude-2026-08-26/catalogo_registros_completude_2026-08-26.json"), "utf8"));
  const recordsData = readFileSync(join(root, "src/data/records.ts"), "utf8");
  const recordsPage = readFileSync(join(root, "app/registros/page.tsx"), "utf8");
  const gallery = readFileSync(join(root, "src/components/RecordsNarrativeGallery.tsx"), "utf8");
  const galleryCompat = readFileSync(join(root, "src/components/RecordsGallery.tsx"), "utf8");
  const lightbox = readFileSync(join(root, "src/components/RecordLightbox.tsx"), "utf8");
  const ids = catalog.items.map((item) => item.id);

  assert.equal(catalog.total, 18);
  assert.equal(ids.length, 18);
  assert.equal(new Set(ids).size, 18);

  const publicItems = catalog.items.filter((item) => item.id !== "preparo-terreno-renques-eaj");
  assert.equal(publicItems.length, 17);
  assert.equal(new Set(publicItems.map((item) => item.id)).size, 17);

  for (const item of publicItems) {
    assert.equal(
      existsSync(join(root, "public/media/records", item.publicFile)),
      true,
      `${item.publicFile} deve existir`
    );
  }

  assert.equal(existsSync(join(root, "public/media/records", "preparo-terreno-renques-eaj.jpg")), false);

  assert.match(recordsPage, /O Projeto Potengi/);
  assert.match(recordsPage, /em campo/);
  assert.match(recordsPage, /records-hero-scrim/);
  assert.match(recordsPage, /records-journey-line/);
  assert.doesNotMatch(recordsPage, /As ações registradas ao longo do projeto/);

  for (const text of [
    "DO TERRITÓRIO À RECUPERAÇÃO",
    "Reconhecer",
    "Validar",
    "Mobilizar",
    "Recuperar",
    "Monitorar",
    "Memória visual das ações",
    "MEMÓRIA DO PROJETO"
  ]) {
    assert.match(recordsPage + gallery, new RegExp(text));
  }

  assert.match(recordsData, /catalogo_registros_completude_2026-08-26\.json/);
  assert.match(recordsData, /const narrativeOrder/);
  assert.match(recordsData, /imageDimensions/);
  assert.doesNotMatch(
    recordsData.match(/const narrativeOrder = \[[\s\S]*?\] as const/)?.[0] ?? "",
    /preparo-terreno-renques-eaj/
  );

  assert.doesNotMatch(gallery, /records-filters|records-category-tabs|availableMetas|availableMunicipalities|Buscar registros/);
  assert.doesNotMatch(galleryCompat, /records-filters|Buscar registros/);
  assert.match(gallery, /tileSizes/);
  assert.match(gallery, /record-tile--feature/);
  assert.match(gallery, /total=\{items\.length\}/);

  assert.match(lightbox, /role="dialog"/);
  assert.match(lightbox, /ArrowLeft/);
  assert.match(lightbox, /ArrowRight/);
  assert.match(lightbox, /resultados#/);
  assert.match(lightbox, /record-lightbox-image/);
  assert.doesNotMatch(lightbox, /fill\s/);
  assert.doesNotMatch(lightbox, /record-lightbox-photo-blur/);
  assert.doesNotMatch(lightbox, /record-lightbox-photo-frame/);
  assert.match(lightbox, /meta\.replace\(\/\\D\+\/g/);

  const publicFiles = [
    "app/registros/page.tsx",
    "src/data/records.ts",
    "src/components/RecordsNarrativeGallery.tsx",
    "src/components/RecordsGallery.tsx",
    "src/components/RecordLightbox.tsx"
  ];

  const publicText = publicFiles
    .map((file) => readFileSync(join(root, file), "utf8").toLocaleLowerCase("pt-BR"))
    .join("\n");

  for (const forbidden of [
    "a confirmar",
    "aprovado_condicionado",
    "aguardando autorização",
    "fotografia candidata",
    "imagem extraída"
  ]) {
    assert.equal(publicText.includes(forbidden), false, `texto público indevido: ${forbidden}`);
  }
});

test("catálogo cartográfico completo mantém previews, filtros e WebGIS restrito", () => {
  const maps = JSON.parse(readFileSync(join(root, "fontes/fase-2/catalogo_mapas_completude_2026-08-26.json"), "utf8"));
  const mapsData = readFileSync(join(root, "src/data/maps.ts"), "utf8");
  const mapsPage = readFileSync(join(root, "app/mapas/page.tsx"), "utf8");
  const catalogBrowser = readFileSync(join(root, "src/components/CatalogBrowser.tsx"), "utf8");
  const ids = maps.items.map((item) => item.id);
  const expectedFeaturedIds = [
    "vulnerabilidade-erosao",
    "areas-prioritarias",
    "uso-cobertura-terra",
    "drenagem-vulnerabilidade-apps",
    "drenagem-apps-criticas-ocupadas",
    "drenagem-alagamento-erosao",
    "agua-indice-seguranca-hidrica",
    "agua-sistemas-produtores-adutoras"
  ];
  const webgisItems = maps.items.filter((item) =>
    ["camada_prioritaria", "camada_disponivel", "camada_parcial"].includes(item.webgisRelation)
  );

  assert.equal(new Set(ids).size, 61);
  assert.equal(maps.items.filter((item) => item.meta.includes(6)).length, 28);
  assert.equal(webgisItems.length, 10);
  assert.equal(webgisItems.filter((item) => item.meta.includes(6)).length, 0);

  for (const item of maps.items) {
    assert.equal(existsSync(join(root, "public/media/maps/previews", `${item.id}.jpg`)), true);
  }

  assert.match(mapsData, /webgisAvailable/);
  assert.match(mapsData, /Disponível no WebGIS/);
  for (const id of expectedFeaturedIds) {
    assert.match(mapsData, new RegExp(`"${id}"`));
  }
  assert.doesNotMatch(mapsData, /"precipitacao-media-anual": \{\s*order/s);
  assert.doesNotMatch(mapsData, /"intensidade-pluviometrica": \{\s*order/s);
  assert.match(catalogBrowser, /featured-filmstrip/);
  assert.match(catalogBrowser, /featured-method-disclosure/);
  assert.match(catalogBrowser, /featured-map-viewport/);
  assert.match(catalogBrowser, /featured-map-image-layer/);
  assert.match(catalogBrowser, /Acervo cartográfico/);
  assert.doesNotMatch(catalogBrowser, /Instituições vinculadas ao projeto/);
  assert.doesNotMatch(catalogBrowser, />\s*arraste\s*</i);
  assert.match(catalogBrowser, /ZoomIn/);
  assert.match(catalogBrowser, /ZoomOut/);
  assert.match(catalogBrowser, /Ajustar/);
  assert.match(catalogBrowser, /Tela cheia/);
  assert.doesNotMatch(mapsData, /"localizacao-bacia": \{\s*order/s);
  assert.equal(ids.includes("localizacao-bacia"), true);
  assert.match(catalogBrowser, /featured-atlas/);
  assert.match(catalogBrowser, /Com WebGIS/);
  assert.match(catalogBrowser, /Abrir mapa/);
  const forbiddenMapText = new RegExp([
    ["Mapa", "est\\u00e1tico"].join(" "),
    ['label: "', "Tipo", '"'].join(""),
    [">", "Tipo", "<"].join("")
  ].join("|"));
  assert.doesNotMatch(mapsData + mapsPage + catalogBrowser, forbiddenMapText);
  assert.match(mapsPage, /Explore os produtos cartográficos produzidos pelo Projeto Potengi/);
});

test("portal público não expõe expressões internas da curadoria", () => {
  const files = [
    "app/page.tsx",
    "app/mapas/page.tsx",
    "app/registros/page.tsx",
    "app/documentos/page.tsx",
    "app/resultados/page.tsx",
    "src/components/CatalogBrowser.tsx",
    "src/data/catalog.ts",
    "src/data/maps.ts",
    "src/data/records.ts",
    "src/data/documents.ts"
  ];
  const publicCode = files.map((file) => readFileSync(join(root, file), "utf8")).join("\n");

  for (const forbidden of [
    "candidato para validação",
    "catálogo central",
    "imagem extraída",
    "captura de mapa",
    "GeoJSON pendente",
    "produto localizado para validação"
  ]) {
    assert.equal(publicCode.toLocaleLowerCase("pt-BR").includes(forbidden.toLocaleLowerCase("pt-BR")), false);
  }
});

test("GeoJSON processados essenciais estão disponíveis e contêm feições", () => {
  const files = [
    "limite-bacia.geojson",
    "rios.geojson",
    "areas-prioritarias-alta.geojson",
    "areas-prioritarias-extrema.geojson",
    "app-wallace.geojson",
    "app-wallace-efemero.geojson",
    "cercas.geojson",
    "coletas.geojson"
  ];

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(root, "public/data/geospatial", file), "utf8"));
    assert.equal(data.type, "FeatureCollection", `${file} deve ser FeatureCollection`);
    assert.ok(Array.isArray(data.features), `${file} deve ter lista de feições`);
    assert.ok(data.features.length > 0, `${file} deve conter feições reais`);
  }
});

test("Resultados usa síntese executiva compacta, mapa territorial e detalhamento limpo das sete metas", () => {
  const page = readFileSync(join(root, "app/resultados/page.tsx"), "utf8");
  const project = readFileSync(join(root, "src/data/project.ts"), "utf8");
  const investment = readFileSync(join(root, "src/components/ResultsInvestmentChart.tsx"), "utf8");
  const territory = readFileSync(join(root, "src/components/ResultsTerritoryMap.tsx"), "utf8");
  const explorer = readFileSync(join(root, "src/components/ResultsGoalsExplorer.tsx"), "utf8");

  for (const required of [
    "Resultados do Projeto Potengi",
    "PANORAMA EXECUTIVO",
    "Distribuição por meta",
    "Bacia do Rio Potengi e municípios com áreas de recuperação",
    "SETE METAS"
  ]) {
    assert.match(page, new RegExp(required));
  }

  for (const removed of [
    "RECUPERAÇÃO AMBIENTAL",
    "EVIDÊNCIAS DO PROJETO",
    "Resultados conectados aos mapas",
    "Explorar o WebGIS",
    "Base documental"
  ]) {
    assert.doesNotMatch(page + explorer, new RegExp(removed, "i"));
  }

  assert.doesNotMatch(page, /RecoveryChart/);
  assert.doesNotMatch(page, /recoveryAreas\.map/);
  assert.doesNotMatch(explorer, /staticMaps|records|documents|Mapas<|Registros<|Documentos</);

  assert.match(project, /projectInvestmentByGoal/);
  assert.match(project, /R\$ 3,0 mi/);
  assert.doesNotMatch(project, /evidence:/);

  assert.match(investment, /projectInvestmentByGoal/);
  assert.match(investment, /results-investment-track/);

  assert.match(territory, /limite-bacia\.geojson/);
  assert.match(territory, /rios\.geojson/);
  assert.match(territory, /new OSM\(\)/);
  assert.match(territory, /Cerro Corá/);
  assert.match(territory, /São Tomé/);
  assert.match(territory, /Macaíba/);
  assert.doesNotMatch(territory, /municipios\.geojson|municípios\.geojson/);

  assert.match(explorer, /Ações realizadas/);
  assert.match(explorer, /Resultados/);
  assert.match(explorer, /Áreas e territórios/);
  assert.match(explorer, /Produtos/);
  assert.doesNotMatch(explorer, /Concluída/);

  assert.doesNotMatch(page + project, /confirmados pela equipe técnica/);
});
