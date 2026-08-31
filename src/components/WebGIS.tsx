"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Feature from "ol/Feature";
import type { FeatureLike } from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import type Geometry from "ol/geom/Geometry";
import Point from "ol/geom/Point";
import Draw from "ol/interaction/Draw";
import { defaults as defaultInteractions } from "ol/interaction/defaults";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorImageLayer from "ol/layer/VectorImage";
import { fromLonLat, getPointResolution, toLonLat, transformExtent } from "ol/proj";
import OSM from "ol/source/OSM";
import ImageStatic from "ol/source/ImageStatic";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { getArea, getLength } from "ol/sphere";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";
import { createResourceCache } from "@/src/lib/webgis-resource-cache";
import {
  ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Crosshair, Download, Eraser, Expand,
  Eye, Focus, Info, Layers, LocateFixed, MapPinned, Minus, MousePointer2, PanelBottomOpen,
  Plus, RotateCcw, Ruler, Search, Table2, Trash2, X
} from "lucide-react";

type CatalogStyle = { fill?: string; stroke?: string; strokeWidth?: number; circleRadius?: number; lineDash?: number[] };
type ClassificationItem = { valor: string | number; rotulo: string; cor: string };
type SymbologyItem = { value: string | number; label: string; color: string };
type SymbologyDescriptor = {
  type: "single" | "categorized" | "graduated" | "continuous" | "raster-categorized";
  geometry: "point" | "line" | "polygon"; field?: string; items?: SymbologyItem[];
  fill?: string; stroke?: string; strokeWidth?: number; radius?: number; lineDash?: number[];
};
type LayerConfig = {
  id: string; titulo: string; arquivo: string; geometria: string; visivel: boolean; opacidade: number;
  minZoom?: number; rotulo?: string; estilo?: CatalogStyle;
  classificacao?: { campo: string; paleta?: string; itens?: ClassificationItem[] };
  symbology?: SymbologyDescriptor;
  camposConsulta: string[]; groupId: string; groupTitle: string;
};
type Catalog = {
  versao: string; crs: string; carregamento: string; totalCamadas: number; notaPublicacao: string;
  grupos: Array<{ id: string; titulo: string; camadas: Array<Omit<LayerConfig, "groupId" | "groupTitle">> }>;
};
type LoadStatus = "idle" | "loading" | "loaded" | "error";
type LayerState = Record<string, { visible: boolean; opacity: number; status: LoadStatus; count: number; error?: string }>;
type MeasureMode = "off" | "LineString" | "Polygon";
type BaseMapKey = "none" | "neutral" | "osm" | "satellite";
type TiledBaseMapKey = Exclude<BaseMapKey, "none">;
type CompositionKey = "diagnostic" | "recovery" | "sanitation";
type RenderVariant = "general" | "medium" | "detail";
type RasterMetadata = {
  extent: [number, number, number, number]; featureCount: number; width: number; height: number;
  symbology?: SymbologyDescriptor;
};
type Attribute = { key: string; label: string; value: string };
type QueryHit = { layer: LayerConfig; feature: Feature<Geometry>; attributes: Attribute[] };
type SearchIndexEntry = {
  id: string; layerId: string; featureIndex: number; title: string; municipality?: string;
  searchText: string;
};
type SearchIndex = { version: number; layerCount: number; entryCount: number; entries: SearchIndexEntry[] };
type SearchHit = SearchIndexEntry & { layer: LayerConfig };
type TableRow = { id: string; featureIndex: number; title: string; values: Record<string, unknown> };
type LayerTable = { version: number; layerId: string; fields: string[]; rows: TableRow[] };
type RecoveryLocation = { id: string; label: string; layerIds: string[]; extent: [number, number, number, number]; coordinate: [number, number] };

const DATA_ROOT = "/data/webgis";
const heavyThemes = new Set(["vulnerabilidade", "uso-solo", "app-hidrografia"]);
const multiscaleLayers = new Set(["vulnerabilidade", "uso-solo", "app-hidrografia", "app-rios"]);
const imageRenderedLayers = new Set(["vulnerabilidade", "uso-solo", "app-hidrografia", "app-rios", "rios", "massas-agua", "geologia", "vegetacao", "pedologia", "aquiferos", "geomorfologia"]);
const nonInteractiveReferenceLayers = new Set(["rios", "massas-agua", "uso-solo", "app-hidrografia", "app-rios", "geologia", "vegetacao", "pedologia", "aquiferos", "geomorfologia"]);
const compositions: Record<CompositionKey, { label: string; layerIds: string[] }> = {
  diagnostic: { label: "Diagnóstico ambiental", layerIds: ["bacia", "rios", "massas-agua", "municipios", "vulnerabilidade"] },
  recovery: { label: "Recuperação", layerIds: ["bacia", "municipios"] },
  sanitation: { label: "Saneamento", layerIds: ["bacia", "municipios", "rios", "tratamento-esgoto", "lixoes", "qualidade-residuos"] }
};
const initialLayerIds = new Set(compositions.diagnostic.layerIds);
const baseMapLabels: Record<BaseMapKey, string> = { none: "Sem base", neutral: "Base clara", osm: "OpenStreetMap", satellite: "Satélite" };
const baseCredits: Record<BaseMapKey, string> = {
  none: "Sem base",
  neutral: "© OpenStreetMap contributors",
  osm: "© OpenStreetMap contributors",
  satellite: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics and the GIS User Community"
};
const jsonCache = createResourceCache<string, unknown>(async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha HTTP ${response.status}`);
  return response.json();
});
let parserWorker: Worker | null = null;
let parserSequence = 0;
const parserRequests = new globalThis.Map<number, { resolve: (data: unknown) => void; reject: (error: Error) => void }>();
const geoJsonCache = createResourceCache<string, unknown>(async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha HTTP ${response.status}`);
  const text = await response.text();
  if (typeof Worker === "undefined") return JSON.parse(text);
  if (!parserWorker) {
    const workerSource = `self.onmessage=({data})=>{try{self.postMessage({id:data.id,data:JSON.parse(data.text)})}catch(error){self.postMessage({id:data.id,error:error instanceof Error?error.message:String(error)})}}`;
    parserWorker = new Worker(URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" })));
    parserWorker.onmessage = ({ data }: MessageEvent<{ id: number; data?: unknown; error?: string }>) => {
      const request = parserRequests.get(data.id); if (!request) return; parserRequests.delete(data.id);
      if (data.error) request.reject(new Error(data.error)); else request.resolve(data.data);
    };
  }
  return new Promise((resolve, reject) => {
    const id = ++parserSequence; parserRequests.set(id, { resolve, reject }); parserWorker?.postMessage({ id, text });
  });
});

function colorWithAlpha(color: string, alpha = "8f") {
  return /^#[0-9a-f]{6}$/i.test(color) ? `${color}${alpha}` : color;
}

function symbologyFor(layer: LayerConfig): SymbologyDescriptor {
  if (layer.symbology) return layer.symbology;
  const geometry = layer.geometria.includes("Point") ? "point" : layer.geometria.includes("LineString") ? "line" : "polygon";
  return { type: "single", geometry, fill: layer.estilo?.fill, stroke: layer.estilo?.stroke, strokeWidth: layer.estilo?.strokeWidth, radius: layer.estilo?.circleRadius, lineDash: layer.estilo?.lineDash };
}

function classColor(layer: LayerConfig, feature: FeatureLike) {
  const descriptor = symbologyFor(layer);
  if (!descriptor.field) return undefined;
  const value = feature.get(descriptor.field);
  return descriptor.items?.find((item) => String(item.value) === String(value))?.color;
}

function createStyleFunction(layer: LayerConfig) {
  const styles = new globalThis.Map<string, Style>();
  return (feature: FeatureLike) => {
    const configured = layer.estilo ?? {};
    const classified = classColor(layer, feature);
    const geometryType = feature.getGeometry()?.getType() ?? layer.geometria;
    const key = `${geometryType}|${classified ?? "default"}`;
    const cached = styles.get(key);
    if (cached) return cached;
    const point = geometryType.includes("Point");
    const line = geometryType.includes("LineString");
    const strokeColor = configured.stroke ?? (classified || (line ? "#176b9c" : "#315f59"));
    const fillColor = configured.fill ?? colorWithAlpha(classified ?? "#6b9f76", "82");
    const style = new Style({
      stroke: new Stroke({ color: strokeColor, width: configured.strokeWidth ?? (line ? 1.8 : 1.1), lineDash: configured.lineDash }),
      fill: point || line ? undefined : new Fill({ color: fillColor }),
      image: point ? new CircleStyle({
        radius: configured.circleRadius ?? 5,
        fill: new Fill({ color: configured.fill ?? classified ?? "#0f766e" }),
        stroke: new Stroke({ color: configured.stroke ?? "#ffffff", width: configured.strokeWidth ?? 1.4 })
      }) : undefined
    });
    styles.set(key, style);
    return style;
  };
}

const selectedStyle = new Style({
  stroke: new Stroke({ color: "#111827", width: 4, lineDash: [7, 4] }),
  fill: new Fill({ color: "rgba(255, 214, 10, 0.32)" }),
  image: new CircleStyle({ radius: 9, fill: new Fill({ color: "#ffd60a" }), stroke: new Stroke({ color: "#111827", width: 3 }) })
});

function labelForField(key: string) {
  const labels: Record<string, string> = {
    area_ha: "Área (ha)", area_km2: "Área (km²)", fonte: "Fonte", fonte_dado: "Fonte",
    area_atuacao: "Área de atuação", uso_principal: "Uso principal", data_registro: "Data do registro",
    valor_referencia: "Valor de referência", precipitacao_mm: "Precipitação (mm)",
    precipitacao_media: "Precipitação média", dias_chuvosos: "Dias chuvosos",
    ordem_drenagem: "Ordem da drenagem", situacao_tratamento: "Situação do tratamento",
    tipo_sistema: "Tipo de sistema", iqr_inferior: "IQR inferior", iqr_medio: "IQR médio",
    iqr_superior: "IQR superior", litotipo_principal: "Litotipo principal", unidade_vegetacao: "Unidade de vegetação"
  };
  return labels[key] ?? key.replace(/_/g, " ").replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function formatValue(value: unknown) {
  return typeof value === "number" ? value.toLocaleString("pt-BR", { maximumFractionDigits: 3 }) : String(value);
}

function publicAttributes(feature: Feature<Geometry>, layer: LayerConfig) {
  return layer.camposConsulta.flatMap((key) => {
    const value = feature.get(key);
    if (value === null || value === undefined || String(value).trim() === "") return [];
    return [{ key, label: labelForField(key), value: formatValue(value) }];
  });
}

function formatMeasure(geometry: Geometry) {
  if (geometry.getType().includes("Polygon")) {
    const area = getArea(geometry);
    return area >= 10_000 ? `${(area / 10_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha` : `${area.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} m²`;
  }
  const length = getLength(geometry);
  return length >= 1_000 ? `${(length / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} km` : `${length.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} m`;
}

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

const LayerSymbol = memo(function LayerSymbol({ layer }: { layer: LayerConfig }) {
  const descriptor = symbologyFor(layer);
  const items = descriptor.items ?? [];
  const title = descriptor.type === "continuous" ? `Simbologia contínua — ${items.length} classes` : descriptor.type !== "single" ? `Simbologia categorizada — ${items.length} classes` : `Símbolo ${descriptor.geometry}`;
  const gradient = items.length ? `linear-gradient(90deg, ${items.map((item) => item.color).join(",")})` : undefined;
  return <span className={`layer-symbol is-${descriptor.geometry} is-${descriptor.type}`} title={title} aria-label={title} style={{
    background: gradient ?? descriptor.fill ?? descriptor.stroke ?? "#5a8a76",
    borderColor: descriptor.stroke ?? (items[0]?.color || "#315f59")
  }} />;
});

function drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = "";
  let currentY = y;
  words.forEach((word) => {
    const next = `${line}${line ? " " : ""}${word}`;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      currentY += lineHeight;
      line = word;
    } else line = next;
  });
  if (line) context.fillText(line, x, currentY);
  return currentY;
}

function drawExportSymbol(context: CanvasRenderingContext2D, descriptor: SymbologyDescriptor, color: string, x: number, y: number) {
  context.fillStyle = color; context.strokeStyle = descriptor.stroke ?? "#315f59";
  if (descriptor.type === "single" && descriptor.geometry === "point") {
    context.beginPath(); context.arc(x + 8, y - 5, 5, 0, Math.PI * 2); context.fill(); context.stroke(); return;
  }
  if (descriptor.type === "single" && descriptor.geometry === "line") {
    context.lineWidth = descriptor.strokeWidth ?? 2; context.beginPath(); context.moveTo(x, y - 5); context.lineTo(x + 17, y - 5); context.stroke(); return;
  }
  context.fillRect(x, y - 10, 16, 10); context.lineWidth = 1; context.strokeRect(x, y - 10, 16, 10);
}

function captureNetworkSnapshot() {
  const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
  const geojson = resources.filter((entry) => /\/data\/webgis\/.*\.geojson(?:\?|$)/.test(entry.name));
  const tiles = resources.filter((entry) => /tile\.openstreetmap\.org|MapServer\/tile\//i.test(entry.name));
  return {
    atMs: Math.round(performance.now()),
    requests: resources.length + 1,
    geojson: geojson.length,
    geojsonUnique: new Set(geojson.map((entry) => entry.name)).size,
    geojsonFiles: geojson.map((entry) => entry.name.split("/").pop()),
    tiles: tiles.length,
    transferredBytes: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
    decodedBytes: resources.reduce((sum, entry) => sum + entry.decodedBodySize, 0),
    badRetinaUrls: resources.filter((entry) => /%7Br%7D|\{r\}/i.test(entry.name)).map((entry) => entry.name),
    cacheBusters: resources.filter((entry) => /nocache|[?&](?:t|time|timestamp)=/i.test(entry.name)).map((entry) => entry.name)
  };
}

type InteractionMetrics = {
  frames: number; droppedFrames: number; maxFrameMs: number;
  longTasks: number; longTaskMs: number; longAnimations: number; blockingMs: number;
};

const LayerCatalogPanel = memo(function LayerCatalogPanel({ catalog, layers, activeLayers, layerState, onToggle, onOpacity, onZoom, onInfo, onData, onMove, onRestoreOrder, onClearLayers }: {
  catalog: Catalog; layers: LayerConfig[]; activeLayers: LayerConfig[]; layerState: LayerState;
  onToggle: (layer: LayerConfig) => void; onOpacity: (layer: LayerConfig, opacity: number) => void;
  onZoom: (layer: LayerConfig) => void; onInfo: (layer: LayerConfig) => void; onData: (layer: LayerConfig) => void;
  onMove: (id: string, direction: -1 | 1) => void; onRestoreOrder: () => void; onClearLayers: () => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["territorio", "diagnostico", "intervencoes"]));
  const [layerFilter, setLayerFilter] = useState("");
  return <div className="sidebar-scroll">
    <label className="layer-search"><Search size={16} /><span className="sr-only">Buscar camada</span><input type="search" value={layerFilter} onChange={(event) => setLayerFilter(event.target.value)} placeholder="Buscar entre 42 camadas" /></label>
    <section className="active-layers" aria-labelledby="active-layers-title">
      <div className="active-layers-heading"><strong id="active-layers-title">Camadas ativas</strong><div><button type="button" onClick={onRestoreOrder} title="Restaurar ordem da composição" aria-label="Restaurar ordem da composição"><RotateCcw size={14} /></button><button className="clear-layers" type="button" onClick={onClearLayers} title="Limpar camadas"><Trash2 size={14} />Limpar camadas</button></div></div>
      {activeLayers.length ? <ol>{activeLayers.map((layer, index) => <li key={layer.id}><LayerSymbol layer={layer} /><span>{layer.titulo}</span><button type="button" disabled={index === 0 || layer.id === "bacia" || activeLayers[index - 1]?.id === "bacia"} onClick={() => onMove(layer.id, -1)} aria-label={`Mover ${layer.titulo} para cima`}><ArrowUp size={13} /></button><button type="button" disabled={index === activeLayers.length - 1 || layer.id === "bacia"} onClick={() => onMove(layer.id, 1)} aria-label={`Mover ${layer.titulo} para baixo`}><ArrowDown size={13} /></button></li>)}</ol> : <p>Nenhuma camada temática ativa.</p>}
    </section>
    <p className="layer-note">{catalog.notaPublicacao}</p>
    {catalog.grupos.map((group) => {
      const groupLayers = layers.filter((layer) => layer.groupId === group.id && layer.titulo.toLocaleLowerCase("pt-BR").includes(layerFilter.toLocaleLowerCase("pt-BR")));
      if (!groupLayers.length) return null;
      const expanded = expandedGroups.has(group.id) || Boolean(layerFilter);
      return <section className="layer-group" key={group.id}>
        <button className="layer-group-toggle" type="button" aria-expanded={expanded} onClick={() => setExpandedGroups((current) => { const next = new Set(current); if (next.has(group.id)) next.delete(group.id); else next.add(group.id); return next; })}><span>{group.titulo}</span><small>{groupLayers.length}</small><ChevronDown size={16} /></button>
        {expanded && <div className="layer-group-items">{groupLayers.map((layer) => {
          const state = layerState[layer.id];
          return <article className={`webgis-layer ${state?.visible ? "is-visible" : ""}`} key={layer.id}>
            <div className="layer-main-row"><label><input type="checkbox" checked={state?.visible ?? false} onChange={() => onToggle(layer)} /><LayerSymbol layer={layer} /><span>{layer.titulo}</span></label><div className="layer-actions"><button type="button" onClick={() => onZoom(layer)} aria-label={`Enquadrar ${layer.titulo}`} title="Enquadrar camada"><Focus size={15} /></button><button type="button" onClick={() => onData(layer)} aria-label={`Dados da camada ${layer.titulo}`} title="Dados da camada"><Table2 size={15} /></button><button type="button" onClick={() => onInfo(layer)} aria-label={`Informações de ${layer.titulo}`} title="Fonte e informações"><Info size={15} /></button></div></div>
            {state?.visible && <div className="layer-controls"><Eye size={14} /><input aria-label={`Opacidade de ${layer.titulo}`} type="range" min="0" max="1" step="0.05" value={state.opacity} onChange={(event) => onOpacity(layer, Number(event.target.value))} /><output>{Math.round(state.opacity * 100)}%</output></div>}
            <div className={`layer-status is-${state?.status ?? "idle"}`} role={state?.status === "error" ? "alert" : undefined}>{state?.status === "loading" && "Carregando…"}{state?.status === "loaded" && `${state.count.toLocaleString("pt-BR")} ${state.count === 1 ? "feição" : "feições"}`}{state?.status === "error" && "Falha nesta camada — tentar novamente"}{state?.status === "idle" && (layer.minZoom ? `Detalhe a partir do zoom ${layer.minZoom}` : "Carregamento sob demanda")}</div>
          </article>;
        })}</div>}
      </section>;
    })}
  </div>;
});

const MapLegend = memo(function MapLegend({ layers, open, onToggle }: { layers: LayerConfig[]; open: boolean; onToggle: () => void }) {
  return <section className={`webgis-legend ${open ? "is-open" : ""}`} aria-label="Legenda dinâmica">
    <button type="button" onClick={onToggle} aria-expanded={open}><span>Legenda</span><small>{layers.length}</small><ChevronDown size={16} /></button>
    {open && <div className="legend-items">{layers.map((layer) => {
      const descriptor = symbologyFor(layer); const items = descriptor.items ?? [];
      if (!items.length) return <span key={layer.id}><LayerSymbol layer={layer} />{layer.titulo}</span>;
      return <details className="legend-classified" key={layer.id} open={items.length <= 8}><summary><strong>{layer.titulo}</strong><small>{items.length} classes</small></summary><div>{items.map((item) => <span key={`${layer.id}-${item.value}`}><i style={{ background: item.color }} />{item.label}</span>)}</div></details>;
    })}</div>}
  </section>;
});

const FeatureSearchPanel = memo(function FeatureSearchPanel({ mobileOpen, term, status, municipalities, municipality, results, onClose, onTerm, onRun, onMunicipality, onOpenResult }: {
  mobileOpen: boolean; term: string; status: string; municipalities: string[]; municipality: string; results: SearchHit[];
  onClose: () => void; onTerm: (value: string) => void; onRun: () => void; onMunicipality: (value: string) => void; onOpenResult: (result: SearchHit) => void;
}) {
  return <section className={`webgis-search-panel ${mobileOpen ? "is-mobile-open" : ""}`} aria-label="Busca de feições">
    <button className="search-panel-close" type="button" onClick={onClose} aria-label="Fechar busca"><X size={18} /></button>
    <div className="feature-search"><label><Search size={16} /><span className="sr-only">Buscar feições</span><input type="search" value={term} onChange={(event) => onTerm(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onRun()} placeholder="Buscar município, rio ou área" /></label><button type="button" onClick={onRun}>Buscar</button></div>
    {status && <p className="search-status" role="status">{status}</p>}
    {municipalities.length > 0 && <label className="municipality-filter">Município<select value={municipality} onChange={(event) => onMunicipality(event.target.value)}><option value="">Todos com campo município</option>{municipalities.map((name) => <option key={name}>{name}</option>)}</select></label>}
    {results.length > 0 && <ul className="search-results">{results.slice(0, 30).map((result) => <li key={result.id}><button type="button" onClick={() => onOpenResult(result)}><strong>{result.title}</strong><span>{result.layer.titulo}</span></button></li>)}</ul>}
  </section>;
});

const LayerDataDrawer = memo(function LayerDataDrawer({ layer, table, loading, query, page, onQuery, onPage, onLocate, onClose }: {
  layer: LayerConfig | null; table: LayerTable | null; loading: boolean; query: string; page: number;
  onQuery: (value: string) => void; onPage: (page: number) => void; onLocate: (row: TableRow) => void; onClose: () => void;
}) {
  if (!layer) return null;
  const normalized = normalizeSearch(query);
  const rows = (table?.rows ?? []).filter((row) => !normalized || normalizeSearch([row.title, ...Object.values(row.values)].join(" ")).includes(normalized));
  const pageSize = 12; const pageCount = Math.max(1, Math.ceil(rows.length / pageSize)); const safePage = Math.min(page, pageCount - 1); const visible = rows.slice(safePage * pageSize, (safePage + 1) * pageSize);
  return <aside className="layer-data-drawer" aria-label={`Dados da camada ${layer.titulo}`}>
    <header><div><span>Dados da camada</span><h2>{layer.titulo}</h2></div><button type="button" onClick={onClose} aria-label="Fechar dados da camada"><X size={18} /></button></header>
    <div className="layer-data-tools"><label><Search size={15} /><span className="sr-only">Pesquisar dados da camada</span><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Pesquisar nos campos públicos" /></label><span>{rows.length.toLocaleString("pt-BR")} registros</span></div>
    {loading ? <p className="layer-data-loading">Carregando tabela leve…</p> : <div className="layer-data-table-wrap"><table><thead><tr><th>Feição</th>{layer.camposConsulta.map((field) => <th key={field}>{labelForField(field)}</th>)}<th>Ação</th></tr></thead><tbody>{visible.map((row) => <tr key={row.id}><th scope="row">{row.title}</th>{layer.camposConsulta.map((field) => <td key={field}>{row.values[field] === undefined ? "—" : formatValue(row.values[field])}</td>)}<td><button type="button" onClick={() => onLocate(row)}>Localizar no mapa</button></td></tr>)}</tbody></table></div>}
    <footer><button type="button" disabled={safePage === 0} onClick={() => onPage(safePage - 1)}>Anterior</button><span>Página {safePage + 1} de {pageCount}</span><button type="button" disabled={safePage >= pageCount - 1} onClick={() => onPage(safePage + 1)}>Próxima</button></footer>
  </aside>;
});

const ExportDialog = memo(function ExportDialog({ open, title, onTitle, onCancel, onConfirm }: { open: boolean; title: string; onTitle: (value: string) => void; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return <div className="webgis-dialog-backdrop" role="presentation"><section className="webgis-export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-dialog-title"><h2 id="export-dialog-title">Exportar mapa em PNG</h2><label>Título do mapa<input autoFocus value={title} onChange={(event) => onTitle(event.target.value)} maxLength={100} /></label><div><button type="button" onClick={onCancel}>Cancelar</button><button type="button" onClick={onConfirm}>Exportar PNG</button></div></section></div>;
});

export default function WebGIS() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const fullscreenElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const configsRef = useRef<Record<string, LayerConfig>>({});
  const vectorLayers = useRef<Record<string, VectorLayer<VectorSource<Feature<Geometry>>> | VectorImageLayer<VectorSource<Feature<Geometry>>>>>({});
  const overviewRasterLayers = useRef<Record<string, ImageLayer<ImageStatic>>>({});
  const scaleRasterSources = useRef<Record<string, Partial<Record<RenderVariant, ImageStatic>>>>({});
  const overviewExtents = useRef<Record<string, Partial<Record<RenderVariant, [number, number, number, number]>>>>({});
  const variantSources = useRef<Record<string, Partial<Record<RenderVariant, VectorSource<Feature<Geometry>>>>>>({});
  const loadPromises = useRef(new globalThis.Map<string, Promise<VectorSource<Feature<Geometry>>>>());
  const baseLayer = useRef<TileLayer<OSM | XYZ> | null>(null);
  const baseSources = useRef<Record<TiledBaseMapKey, OSM | XYZ>>({} as Record<TiledBaseMapKey, OSM | XYZ>);
  const drawRef = useRef<Draw | null>(null);
  const measureSource = useRef(new VectorSource<Feature<Geometry>>());
  const selectionSource = useRef(new VectorSource<Feature<Geometry>>());
  const locationSource = useRef(new VectorSource<Feature<Geometry>>());
  const recoveryOverviewSource = useRef(new VectorSource<Feature<Geometry>>());
  const recoveryOverviewLayer = useRef<VectorLayer<VectorSource<Feature<Geometry>>> | null>(null);
  const recoveryFocusHandler = useRef<(id: string) => void>(() => undefined);
  const desiredVisibility = useRef<Record<string, boolean>>({});
  const compositionOrderRef = useRef<string[]>(compositions.diagnostic.layerIds);
  const activeCompositionRef = useRef<CompositionKey | null>("diagnostic");
  const coordinatesElement = useRef<HTMLSpanElement | null>(null);
  const initialized = useRef(false);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [layerState, setLayerState] = useState<LayerState>({});
  const [layerOrder, setLayerOrder] = useState<string[]>([]);
  const [baseMap, setBaseMap] = useState<BaseMapKey>("neutral");
  const [activeComposition, setActiveComposition] = useState<CompositionKey | null>("diagnostic");
  const [recoveryLocations, setRecoveryLocations] = useState<RecoveryLocation[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobilePanel, setMobilePanel] = useState<"layers" | "search" | null>(null);
  const [measureMode, setMeasureMode] = useState<MeasureMode>("off");
  const [measureText, setMeasureText] = useState("Nenhuma medição");
  const [queryHits, setQueryHits] = useState<QueryHit[]>([]);
  const [queryIndex, setQueryIndex] = useState(0);
  const [infoLayer, setInfoLayer] = useState<LayerConfig | null>(null);
  const [infoSource, setInfoSource] = useState("Projeto Rio Potengi e fontes indicadas na camada");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [municipalityFilter, setMunicipalityFilter] = useState("");
  const [exportTitle, setExportTitle] = useState("WebGIS do Projeto Rio Potengi");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [dataLayer, setDataLayer] = useState<LayerConfig | null>(null);
  const [layerTable, setLayerTable] = useState<LayerTable | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableQuery, setTableQuery] = useState("");
  const [tablePage, setTablePage] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [legendOpen, setLegendOpen] = useState(true);
  const renderCount = useRef(0);
  useEffect(() => { renderCount.current += 1; });

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("perf")) return;
    const metrics: InteractionMetrics = { frames: 0, droppedFrames: 0, maxFrameMs: 0, longTasks: 0, longTaskMs: 0, longAnimations: 0, blockingMs: 0 };
    let previousFrame = performance.now();
    let animationFrame = 0;
    const sampleFrame = (now: number) => {
      const duration = now - previousFrame;
      previousFrame = now;
      metrics.frames += 1;
      metrics.maxFrameMs = Math.max(metrics.maxFrameMs, duration);
      metrics.droppedFrames += Math.max(0, Math.round(duration / 16.67) - 1);
      animationFrame = requestAnimationFrame(sampleFrame);
    };
    animationFrame = requestAnimationFrame(sampleFrame);
    const observers: PerformanceObserver[] = [];
    if (PerformanceObserver.supportedEntryTypes.includes("longtask")) {
      const observer = new PerformanceObserver((list) => list.getEntries().forEach((entry) => { metrics.longTasks += 1; metrics.longTaskMs += entry.duration; }));
      observer.observe({ type: "longtask", buffered: true }); observers.push(observer);
    }
    if (PerformanceObserver.supportedEntryTypes.includes("long-animation-frame")) {
      const observer = new PerformanceObserver((list) => list.getEntries().forEach((entry) => {
        metrics.longAnimations += 1;
        metrics.blockingMs += Number((entry as PerformanceEntry & { blockingDuration?: number }).blockingDuration ?? 0);
      }));
      observer.observe({ type: "long-animation-frame", buffered: true }); observers.push(observer);
    }
    const update = () => {
      if (fullscreenElement.current) fullscreenElement.current.dataset.perfSnapshot = JSON.stringify({ ...captureNetworkSnapshot(), ...metrics, reactRenders: renderCount.current });
    };
    update();
    const interval = window.setInterval(update, 250);
    return () => { window.clearInterval(interval); cancelAnimationFrame(animationFrame); observers.forEach((observer) => observer.disconnect()); };
  }, []);

  const layers = useMemo(() => catalog?.grupos.flatMap((group) => group.camadas.map((layer) => ({ ...layer, groupId: group.id, groupTitle: group.titulo }))) ?? [], [catalog]);
  const visibleLayers = useMemo(() => layerOrder.flatMap((id) => { const layer = layers.find((candidate) => candidate.id === id); return layer && layerState[id]?.visible ? [layer] : []; }), [layerOrder, layers, layerState]);
  const activeHit = queryHits[queryIndex];
  const municipalities = useMemo(() => Array.from(new Set(searchResults.map((result) => result.municipality).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR")), [searchResults]);
  const filteredSearchResults = useMemo(() => municipalityFilter ? searchResults.filter((result) => result.municipality === municipalityFilter) : searchResults, [municipalityFilter, searchResults]);
  const toggleLegend = useCallback(() => setLegendOpen((open) => !open), []);
  const closeMobilePanel = useCallback(() => setMobilePanel(null), []);
  const changeSearchTerm = useCallback((value: string) => setSearchTerm(value), []);
  const changeMunicipality = useCallback((value: string) => setMunicipalityFilter(value), []);
  const changeTableQuery = useCallback((value: string) => { setTableQuery(value); setTablePage(0); }, []);
  const closeLayerData = useCallback(() => { setDataLayer(null); setLayerTable(null); }, []);
  const cancelExport = useCallback(() => setExportDialogOpen(false), []);

  const syncLayerVisibility = useCallback((id: string) => {
    const zoom = mapRef.current?.getView().getZoom() ?? 8;
    const desired = Boolean(desiredVisibility.current[id]);
    const vector = vectorLayers.current[id];
    const raster = overviewRasterLayers.current[id];
    if (raster) {
      const variant: RenderVariant = zoom < 10 ? "general" : "medium";
      const source = scaleRasterSources.current[id]?.[variant] ?? null;
      if (raster.getSource() !== source) raster.setSource(source);
      raster.setVisible(desired && Boolean(source));
      vector?.setVisible(false);
      return;
    }
    raster?.setVisible(false);
    vector?.setVisible(desired && Boolean(vector.getSource()?.getFeatures().length));
  }, []);

  const loadLayer = useCallback(async (id: string, requestedVariant?: RenderVariant) => {
    const zoom = mapRef.current?.getView().getZoom() ?? 8;
    const variant: RenderVariant = multiscaleLayers.has(id) ? (requestedVariant ?? (zoom < 10 ? "general" : "medium")) : "detail";
    const promiseKey = `${id}:${variant}`;
    const existing = loadPromises.current.get(promiseKey);
    if (existing) return existing.then((source) => {
      const currentZoom = mapRef.current?.getView().getZoom() ?? 8;
      const currentVariant: RenderVariant = multiscaleLayers.has(id) ? (currentZoom < 10 ? "general" : "medium") : "detail";
      const layer = vectorLayers.current[id];
      if (layer && currentVariant === variant && variant === "detail") layer.setSource(source);
      syncLayerVisibility(id);
      return source;
    });
    const config = configsRef.current[id];
    const layer = vectorLayers.current[id];
    if (!config || !layer) throw new Error("Camada não disponível.");
    setLayerState((current) => ({ ...current, [id]: { ...current[id], status: "loading", error: undefined } }));
    const targetLayer = layer;
    const source = variantSources.current[id]?.[variant] ?? new VectorSource<Feature<Geometry>>();
    variantSources.current[id] = { ...variantSources.current[id], [variant]: source };
    if (variant !== "detail" && multiscaleLayers.has(id)) {
      const suffix = variant === "general" ? "geral" : "intermediario";
      const promise = jsonCache.load(`${DATA_ROOT}/${id}-${suffix}-raster.json`)
        .then((data) => {
          const metadata = data as RasterMetadata;
          overviewExtents.current[id] = { ...overviewExtents.current[id], [variant]: metadata.extent };
          const rasterSource = new ImageStatic({
            url: `${DATA_ROOT}/${id}-${suffix}.png`, imageExtent: metadata.extent,
            projection: "EPSG:3857", interpolate: true, crossOrigin: "anonymous"
          });
          scaleRasterSources.current[id] = { ...scaleRasterSources.current[id], [variant]: rasterSource };
          syncLayerVisibility(id);
          setLayerState((current) => ({ ...current, [id]: { ...current[id], status: "loaded", count: metadata.featureCount } }));
          return source;
        })
        .catch((error: unknown) => {
          loadPromises.current.delete(promiseKey);
          const message = error instanceof Error ? error.message : "Falha desconhecida";
          setLayerState((current) => ({ ...current, [id]: { ...current[id], status: "error", count: 0, error: message } }));
          throw error;
        });
      loadPromises.current.set(promiseKey, promise);
      return promise;
    }
    const variantFile = variant === "general" ? `${id}-geral.geojson` : variant === "medium" ? `${id}-intermediario.geojson` : config.arquivo;
    const promise = geoJsonCache.load(`${DATA_ROOT}/${variantFile}`)
      .then((data) => {
        if (source.getFeatures().length === 0) source.addFeatures(new GeoJSON().readFeatures(data, { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" }) as Feature<Geometry>[]);
        if (vectorLayers.current[id] === targetLayer) {
          const currentZoom = mapRef.current?.getView().getZoom() ?? 8;
          const currentVariant: RenderVariant = multiscaleLayers.has(id) ? (currentZoom < 10 ? "general" : "medium") : "detail";
          if (currentVariant === variant) targetLayer.setSource(source);
          syncLayerVisibility(id);
          setLayerState((current) => ({ ...current, [id]: { ...current[id], status: "loaded", count: source.getFeatures().length } }));
        }
        return source;
      })
      .catch((error: unknown) => {
        loadPromises.current.delete(promiseKey);
        const message = error instanceof Error ? error.message : "Falha desconhecida";
        if (vectorLayers.current[id] === targetLayer) setLayerState((current) => ({ ...current, [id]: { ...current[id], status: "error", count: 0, error: message } }));
        throw error;
      });
    loadPromises.current.set(promiseKey, promise);
    return promise;
  }, [syncLayerVisibility]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      jsonCache.load(`${DATA_ROOT}/camadas-webgis.json`),
      jsonCache.load(`${DATA_ROOT}/simbologia-webgis.json`),
      jsonCache.load(`${DATA_ROOT}/locais-recuperacao.json`)
    ])
      .then(([data, symbologyData, recoveryData]) => {
        const descriptors = (symbologyData as { layers: Record<string, SymbologyDescriptor> }).layers;
        const rawCatalog = data as Catalog;
        const nextCatalog: Catalog = { ...rawCatalog, grupos: rawCatalog.grupos.map((group) => ({ ...group, camadas: group.camadas.map((layer) => ({ ...layer, symbology: descriptors[layer.id] })) })) };
        if (cancelled) return;
        const flattened = nextCatalog.grupos.flatMap((group) => group.camadas.map((layer) => ({ ...layer, groupId: group.id, groupTitle: group.titulo })));
        configsRef.current = Object.fromEntries(flattened.map((layer) => [layer.id, layer]));
        desiredVisibility.current = Object.fromEntries(flattened.map((layer) => [layer.id, initialLayerIds.has(layer.id)]));
        setLayerState(Object.fromEntries(flattened.map((layer) => [layer.id, { visible: initialLayerIds.has(layer.id), opacity: layer.opacidade, status: "idle" as const, count: 0 }])));
        setLayerOrder([...compositions.diagnostic.layerIds, ...flattened.map((layer) => layer.id).filter((id) => !initialLayerIds.has(id))]);
        setRecoveryLocations((recoveryData as { locations: RecoveryLocation[] }).locations);
        setCatalog(nextCatalog);
      })
      .catch(() => !cancelled && setCatalogError("Não foi possível carregar o catálogo das camadas."));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!catalog || !mapElement.current || initialized.current) return;
    let map: Map | null = null;
    const currentLoadPromises = loadPromises.current;
    let coordinateFrame = 0;
    let pointerHandler: ((event: { coordinate: number[] }) => void) | null = null;
    let clickHandler: ((event: { coordinate: number[]; pixel: number[] }) => void) | null = null;
    let moveEndHandler: (() => void) | null = null;
    const frame = requestAnimationFrame(() => {
      if (!mapElement.current || initialized.current) return;
      initialized.current = true;
      const neutral = new OSM({ crossOrigin: "anonymous", transition: 0 });
      const osm = new OSM({ crossOrigin: "anonymous", transition: 0 });
      const satellite = new XYZ({ url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attributions: baseCredits.satellite, crossOrigin: "anonymous", transition: 0 });
      baseSources.current = { neutral, osm, satellite };
      const tiles = new TileLayer({ className: "webgis-basemap", source: neutral, preload: 0 });
      baseLayer.current = tiles;
      const nextMap = new Map({
        target: mapElement.current, layers: [tiles],
        controls: defaultControls({ attribution: true, zoom: false, rotate: false }).extend([new ScaleLine({ bar: true, text: true, minWidth: 110 })]),
        interactions: defaultInteractions({ zoomDuration: 160, pinchRotate: false }),
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        view: new View({ center: fromLonLat([-35.86, -5.94]), zoom: 8, minZoom: 5, maxZoom: 19 })
      });
      map = nextMap;
    const initialOrder = [...compositions.diagnostic.layerIds, ...layers.map((layer) => layer.id).filter((id) => !initialLayerIds.has(id))];
    layers.forEach((config) => {
      const source = new VectorSource<Feature<Geometry>>();
      variantSources.current[config.id] = { detail: source };
      const vector = imageRenderedLayers.has(config.id)
        ? new VectorImageLayer({ source, visible: false, opacity: config.opacidade, minZoom: config.minZoom, style: createStyleFunction(config), renderBuffer: 24, imageRatio: 1 })
        : new VectorLayer({ source, visible: false, opacity: config.opacidade, minZoom: config.minZoom, style: createStyleFunction(config), renderBuffer: 24, updateWhileAnimating: false, updateWhileInteracting: false });
      const zIndex = 220 - initialOrder.indexOf(config.id);
      vector.set("layerId", config.id); vector.setZIndex(zIndex); vectorLayers.current[config.id] = vector; nextMap.addLayer(vector);
      if (multiscaleLayers.has(config.id)) {
        const raster = new ImageLayer<ImageStatic>({ visible: false, opacity: config.opacidade });
        raster.set("layerId", `${config.id}-overview-raster`); raster.setZIndex(zIndex);
        overviewRasterLayers.current[config.id] = raster; nextMap.addLayer(raster);
      }
    });
    recoveryOverviewSource.current.clear();
    recoveryOverviewSource.current.addFeatures(recoveryLocations.map((location) => new Feature({ geometry: new Point(fromLonLat(location.coordinate)), locationId: location.id, label: location.label })));
    const recoveryStyles = new globalThis.Map<string, Style>();
    const recoveryLayer = new VectorLayer({ source: recoveryOverviewSource.current, visible: false, declutter: true, style: (feature) => {
      const label = String(feature.get("label")); const cached = recoveryStyles.get(label); if (cached) return cached;
      const style = new Style({ image: new CircleStyle({ radius: 8, fill: new Fill({ color: "#f2c84b" }), stroke: new Stroke({ color: "#633c08", width: 2.5 }) }), text: new Text({ text: label, offsetY: -18, font: "700 12px Arial", fill: new Fill({ color: "#102f37" }), stroke: new Stroke({ color: "rgba(255,255,255,.96)", width: 4 }), padding: [3, 5, 3, 5] }) });
      recoveryStyles.set(label, style); return style;
    } });
    recoveryLayer.setZIndex(260); recoveryOverviewLayer.current = recoveryLayer; nextMap.addLayer(recoveryLayer);
    const measureLayer = new VectorLayer({ source: measureSource.current, style: new Style({ stroke: new Stroke({ color: "#102a43", width: 3, lineDash: [8, 6] }), fill: new Fill({ color: "rgba(255, 214, 10, 0.22)" }), image: new CircleStyle({ radius: 5, fill: new Fill({ color: "#102a43" }) }) }) });
    measureLayer.setZIndex(280); nextMap.addLayer(measureLayer);
    const selectionLayer = new VectorLayer({ source: selectionSource.current, style: selectedStyle }); selectionLayer.setZIndex(300); nextMap.addLayer(selectionLayer);
    const locationLayer = new VectorLayer({ source: locationSource.current, style: new Style({ image: new CircleStyle({ radius: 8, fill: new Fill({ color: "#ffd60a" }), stroke: new Stroke({ color: "#102a43", width: 3 }) }) }) });
    locationLayer.setZIndex(310); nextMap.addLayer(locationLayer);
    pointerHandler = (event) => {
      if (coordinateFrame) return;
      coordinateFrame = requestAnimationFrame(() => {
        coordinateFrame = 0;
        const [lon, lat] = toLonLat(event.coordinate);
        if (coordinatesElement.current) coordinatesElement.current.textContent = `Lon ${lon.toFixed(4)} | Lat ${lat.toFixed(4)}`;
      });
    };
    clickHandler = (event) => {
      if (drawRef.current) return;
      let recoveryFeature: Feature<Geometry> | undefined;
      if (recoveryOverviewLayer.current?.getVisible()) nextMap.forEachFeatureAtPixel(event.pixel, (feature) => { recoveryFeature = feature as Feature<Geometry>; return true; }, { hitTolerance: 8, layerFilter: (candidate) => candidate === recoveryOverviewLayer.current });
      if (recoveryFeature) { recoveryFocusHandler.current(String(recoveryFeature.get("locationId"))); return; }
      const hits: QueryHit[] = [];
      Object.entries(vectorLayers.current).some(([id, layer]) => {
        if (!desiredVisibility.current[id] || nonInteractiveReferenceLayers.has(id) || !layer.getVisible()) return false;
        const config = configsRef.current[id];
        layer.getSource()?.getFeaturesAtCoordinate(event.coordinate).some((feature) => {
          hits.push({ layer: config, feature, attributes: publicAttributes(feature, config) });
          return hits.length >= 12;
        });
        return hits.length >= 12;
      });
      setInfoLayer(null); setQueryHits(hits); setQueryIndex(0); selectionSource.current.clear();
      if (hits[0]) selectionSource.current.addFeature(hits[0].feature.clone());
      if ((nextMap.getView().getZoom() ?? 8) >= 15 && desiredVisibility.current.vulnerabilidade) {
        loadLayer("vulnerabilidade", "detail").then((source) => {
          const feature = source.getFeaturesAtCoordinate(event.coordinate)[0];
          if (!feature) return;
          const config = configsRef.current.vulnerabilidade;
          const hit = { layer: config, feature, attributes: publicAttributes(feature, config) };
          setInfoLayer(null); setQueryHits((current) => [hit, ...current.filter((item) => item.layer.id !== config.id)].slice(0, 12)); setQueryIndex(0);
          selectionSource.current.clear(); selectionSource.current.addFeature(feature.clone());
        }).catch(() => undefined);
      }
    };
    nextMap.on("pointermove", pointerHandler);
    nextMap.on("singleclick", clickHandler);
    moveEndHandler = () => {
      recoveryOverviewLayer.current?.setVisible(activeCompositionRef.current === "recovery" && (nextMap.getView().getZoom() ?? 8) < 10);
      multiscaleLayers.forEach((id) => {
        if (!desiredVisibility.current[id]) return;
        syncLayerVisibility(id);
        loadLayer(id).catch(() => undefined);
      });
    };
    nextMap.on("moveend", moveEndHandler);
    mapRef.current = nextMap;
    Promise.allSettled(layers.filter((layer) => initialLayerIds.has(layer.id)).map((layer) => loadLayer(layer.id))).then(() => {
      loadLayer("bacia").then((source) => {
        const extent = source.getExtent();
        if (extent) nextMap.getView().fit(extent, { padding: [76, 76, 76, 76], duration: 320, maxZoom: 9 });
        if (fullscreenElement.current) fullscreenElement.current.dataset.mapUsableMs = Math.round(performance.now()).toString();
      }).catch(() => undefined);
    });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (coordinateFrame) cancelAnimationFrame(coordinateFrame);
      if (map && pointerHandler) map.un("pointermove", pointerHandler);
      if (map && clickHandler) map.un("singleclick", clickHandler);
      if (map && moveEndHandler) map.un("moveend", moveEndHandler);
      map?.setTarget(undefined);
      mapRef.current = null; baseLayer.current = null; recoveryOverviewLayer.current = null; vectorLayers.current = {}; overviewRasterLayers.current = {}; scaleRasterSources.current = {}; overviewExtents.current = {}; variantSources.current = {}; currentLoadPromises.clear(); initialized.current = false;
    };
  }, [catalog, layers, loadLayer, recoveryLocations, syncLayerVisibility]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (drawRef.current) { drawRef.current.abortDrawing(); mapRef.current?.removeInteraction(drawRef.current); drawRef.current = null; }
      setMeasureMode("off"); setMobilePanel(null);
    };
    const resizeHandler = () => mapRef.current?.updateSize();
    window.addEventListener("keydown", keyHandler); document.addEventListener("fullscreenchange", resizeHandler);
    return () => { window.removeEventListener("keydown", keyHandler); document.removeEventListener("fullscreenchange", resizeHandler); };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (drawRef.current) { map.removeInteraction(drawRef.current); drawRef.current = null; }
    if (measureMode === "off") return;
    const draw = new Draw({ source: measureSource.current, type: measureMode });
    draw.on("drawend", (event) => { const geometry = event.feature.getGeometry(); if (geometry) setMeasureText(formatMeasure(geometry)); });
    map.addInteraction(draw); drawRef.current = draw;
    return () => { map.removeInteraction(draw); if (drawRef.current === draw) drawRef.current = null; };
  }, [measureMode]);

  useEffect(() => {
    const layer = baseLayer.current; if (!layer) return;
    if (baseMap === "none") layer.setVisible(false);
    else { layer.setSource(baseSources.current[baseMap]); layer.setVisible(true); }
  }, [baseMap]);
  useEffect(() => { activeCompositionRef.current = activeComposition; recoveryOverviewLayer.current?.setVisible(activeComposition === "recovery" && (mapRef.current?.getView().getZoom() ?? 8) < 10); }, [activeComposition]);
  useEffect(() => {
    const municipalitiesLayer = vectorLayers.current.municipios; const state = layerState.municipios; if (!municipalitiesLayer || !state) return;
    const denseActive = visibleLayers.some((layer) => layer.id !== "municipios" && Boolean(symbologyFor(layer).items?.length));
    municipalitiesLayer.setOpacity(denseActive ? state.opacity * 0.42 : state.opacity);
  }, [layerState, visibleLayers]);
  useEffect(() => {
    layerOrder.forEach((id, index) => { const zIndex = 220 - index; vectorLayers.current[id]?.setZIndex(zIndex); overviewRasterLayers.current[id]?.setZIndex(zIndex); });
  }, [layerOrder]);
  useEffect(() => { selectionSource.current.clear(); if (activeHit) selectionSource.current.addFeature(activeHit.feature.clone()); }, [activeHit]);

  const toggleLayer = useCallback((config: LayerConfig) => {
    const nextVisible = !desiredVisibility.current[config.id];
    activeCompositionRef.current = null; setActiveComposition(null);
    if (nextVisible) setLayerOrder((current) => current.includes(config.id) ? current : [config.id, ...current]);
    desiredVisibility.current[config.id] = nextVisible;
    if (nextVisible && heavyThemes.has(config.id)) heavyThemes.forEach((id) => {
      if (id !== config.id) { desiredVisibility.current[id] = false; vectorLayers.current[id]?.setVisible(false); overviewRasterLayers.current[id]?.setVisible(false); }
    });
    setLayerState((current) => {
      const next = { ...current };
      if (nextVisible && heavyThemes.has(config.id)) heavyThemes.forEach((id) => { if (id !== config.id && next[id]) next[id] = { ...next[id], visible: false }; });
      next[config.id] = { ...next[config.id], visible: nextVisible }; return next;
    });
    const vector = vectorLayers.current[config.id];
    if (!nextVisible) { vector?.setVisible(false); overviewRasterLayers.current[config.id]?.setVisible(false); }
    else {
      syncLayerVisibility(config.id);
      loadLayer(config.id).then(() => syncLayerVisibility(config.id)).catch(() => undefined);
    }
  }, [loadLayer, syncLayerVisibility]);

  function applyComposition(key: CompositionKey) {
    const selected = new Set(compositions[key].layerIds);
    compositionOrderRef.current = [...compositions[key].layerIds]; activeCompositionRef.current = key;
    setLayerOrder((current) => [...compositions[key].layerIds, ...current.filter((id) => !selected.has(id))]);
    setActiveComposition(key); setQueryHits([]); setInfoLayer(null); selectionSource.current.clear();
    Object.entries(vectorLayers.current).forEach(([id, layer]) => {
      const visible = selected.has(id); desiredVisibility.current[id] = visible;
      layer.setVisible(false); overviewRasterLayers.current[id]?.setVisible(false);
      if (visible) syncLayerVisibility(id);
    });
    setLayerState((current) => Object.fromEntries(Object.entries(current).map(([id, state]) => [id, { ...state, visible: selected.has(id) }])));
    Promise.allSettled(compositions[key].layerIds.map((id) => loadLayer(id))).then(() => {
      const basinSource = vectorLayers.current.bacia?.getSource();
      const extent = basinSource?.getExtent();
      if (extent) mapRef.current?.getView().fit(extent, { padding: [70, 70, 70, 70], duration: 280, maxZoom: 9 });
    });
  }

  const moveActiveLayer = useCallback((id: string, direction: -1 | 1) => {
    activeCompositionRef.current = null; setActiveComposition(null);
    setLayerOrder((current) => { const visible = current.filter((layerId) => desiredVisibility.current[layerId]); const index = visible.indexOf(id); const swapId = visible[index + direction]; if (!swapId || id === "bacia" || swapId === "bacia") return current; const next = [...current]; const a = next.indexOf(id); const b = next.indexOf(swapId); [next[a], next[b]] = [next[b], next[a]]; return next; });
  }, []);

  const restoreLayerOrder = useCallback(() => {
    setLayerOrder((current) => { const preferred = compositionOrderRef.current; return [...preferred, ...current.filter((id) => !preferred.includes(id))]; });
  }, []);

  const clearLayers = useCallback(() => {
    activeCompositionRef.current = null; setActiveComposition(null); recoveryOverviewLayer.current?.setVisible(false);
    Object.keys(desiredVisibility.current).forEach((id) => { desiredVisibility.current[id] = false; vectorLayers.current[id]?.setVisible(false); overviewRasterLayers.current[id]?.setVisible(false); });
    setLayerState((current) => Object.fromEntries(Object.entries(current).map(([id, state]) => [id, { ...state, visible: false }])));
  }, []);

  const focusRecoveryLocation = useCallback((location: RecoveryLocation) => {
    const selectedIds = ["bacia", ...location.layerIds, "municipios"]; const selected = new Set(selectedIds);
    activeCompositionRef.current = "recovery"; setActiveComposition("recovery"); compositionOrderRef.current = selectedIds;
    setLayerOrder((current) => [...selectedIds, ...current.filter((id) => !selected.has(id))]);
    Object.keys(desiredVisibility.current).forEach((id) => { const visible = selected.has(id); desiredVisibility.current[id] = visible; vectorLayers.current[id]?.setVisible(false); overviewRasterLayers.current[id]?.setVisible(false); });
    setLayerState((current) => Object.fromEntries(Object.entries(current).map(([id, state]) => [id, { ...state, visible: selected.has(id) }])));
    Promise.allSettled(location.layerIds.map((id) => loadLayer(id))).then(() => {
      location.layerIds.forEach(syncLayerVisibility); mapRef.current?.getView().fit(transformExtent(location.extent, "EPSG:4326", "EPSG:3857"), { padding: [100, 100, 100, 100], duration: 300, maxZoom: 15 });
    });
  }, [loadLayer, syncLayerVisibility]);
  useEffect(() => { recoveryFocusHandler.current = (id) => { const location = recoveryLocations.find((candidate) => candidate.id === id); if (location) focusRecoveryLocation(location); }; }, [focusRecoveryLocation, recoveryLocations]);

  const openLayerData = useCallback((layer: LayerConfig) => {
    setDataLayer(layer); setLayerTable(null); setTableQuery(""); setTablePage(0); setTableLoading(true);
    jsonCache.load(`${DATA_ROOT}/tabelas/${layer.id}.json`).then((data) => setLayerTable(data as LayerTable)).catch(() => setStatusMessage("Não foi possível carregar os dados públicos desta camada.")).finally(() => setTableLoading(false));
  }, []);

  const locateTableRow = useCallback(async (row: TableRow) => {
    if (!dataLayer) return; const source = await loadLayer(dataLayer.id, "detail"); const feature = source.getFeatures()[row.featureIndex]; if (!feature) return;
    activeCompositionRef.current = null; setActiveComposition(null);
    setLayerOrder((current) => current.includes(dataLayer.id) ? current : [dataLayer.id, ...current]);
    desiredVisibility.current[dataLayer.id] = true; syncLayerVisibility(dataLayer.id); setLayerState((current) => ({ ...current, [dataLayer.id]: { ...current[dataLayer.id], visible: true } }));
    selectionSource.current.clear(); selectionSource.current.addFeature(feature.clone()); const geometry = feature.getGeometry(); if (geometry) mapRef.current?.getView().fit(geometry.getExtent(), { padding: [110, 90, 110, 90], duration: 300, maxZoom: 16 });
  }, [dataLayer, loadLayer, syncLayerVisibility]);

  const changeOpacity = useCallback((config: LayerConfig, opacity: number) => {
    vectorLayers.current[config.id]?.setOpacity(opacity);
    overviewRasterLayers.current[config.id]?.setOpacity(opacity);
    setLayerState((current) => ({ ...current, [config.id]: { ...current[config.id], opacity } }));
  }, []);

  const zoomToLayer = useCallback(async (config: LayerConfig) => {
    try {
      const source = await loadLayer(config.id);
      const zoom = mapRef.current?.getView().getZoom() ?? 8;
      const variant: RenderVariant = zoom < 10 ? "general" : "medium";
      const extent = overviewExtents.current[config.id]?.[variant] ?? source.getExtent();
      if (extent) mapRef.current?.getView().fit(extent, { padding: [76, 76, 76, 76], duration: 300, maxZoom: 15 });
    } catch { setStatusMessage(`Não foi possível enquadrar “${config.titulo}”.`); }
  }, [loadLayer]);

  const showLayerInfo = useCallback((config: LayerConfig) => {
    setInfoLayer(config); setQueryHits([]); setInfoSource("Projeto Rio Potengi e fontes indicadas na camada");
  }, []);

  async function zoomToBasin() { const config = configsRef.current.bacia; if (config) await zoomToLayer(config); }
  function zoomBy(delta: number) { const view = mapRef.current?.getView(); if (view) view.animate({ zoom: (view.getZoom() ?? 8) + delta, duration: 160 }); }

  function useLocation() {
    if (!navigator.geolocation) { setStatusMessage("A geolocalização não está disponível neste navegador."); return; }
    setStatusMessage("Obtendo sua localização…");
    navigator.geolocation.getCurrentPosition((position) => {
      const coordinate = fromLonLat([position.coords.longitude, position.coords.latitude]);
      locationSource.current.clear(); locationSource.current.addFeature(new Feature({ geometry: new Point(coordinate) }));
      mapRef.current?.getView().animate({ center: coordinate, zoom: 14, duration: 360 }); setStatusMessage("Localização exibida no mapa.");
    }, () => setStatusMessage("Não foi possível obter sua localização. Verifique a permissão do navegador."), { enableHighAccuracy: true, timeout: 10_000 });
  }

  function selectMeasure(mode: MeasureMode) {
    setMeasureMode(mode);
    if (mode === "LineString") setMeasureText("Clique para iniciar; clique duplo para concluir a distância.");
    if (mode === "Polygon") setMeasureText("Clique para iniciar; clique duplo para concluir a área.");
  }

  function clearMapWork() {
    measureSource.current.clear(); selectionSource.current.clear(); setMeasureMode("off"); setMeasureText("Nenhuma medição");
    setQueryHits([]); setInfoLayer(null); setInfoSource("Projeto Rio Potengi e fontes indicadas na camada"); setStatusMessage("Seleção e medições removidas.");
  }

  async function requestFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await fullscreenElement.current?.requestFullscreen(); }
    catch { setStatusMessage("A tela cheia não pôde ser ativada neste navegador."); }
  }

  const runSearch = useCallback(async () => {
    const term = normalizeSearch(searchTerm.trim());
    if (!term) { setSearchResults([]); setSearchStatus("Digite um nome para pesquisar."); return; }
    setSearchStatus(`Pesquisando no índice das ${layers.length} camadas…`); setMunicipalityFilter("");
    try {
      const index = await jsonCache.load(`${DATA_ROOT}/indice-busca.json`) as SearchIndex;
      const byId = configsRef.current;
      const results = index.entries.filter((entry) => entry.searchText.includes(term)).flatMap((entry) => {
        const layer = byId[entry.layerId];
        return layer ? [{ ...entry, layer }] : [];
      });
      setSearchResults(results.slice(0, 200));
      setSearchStatus(results.length ? `${results.length} resultado${results.length === 1 ? "" : "s"} encontrado${results.length === 1 ? "" : "s"}.` : "Nenhum resultado encontrado.");
    } catch {
      setSearchResults([]); setSearchStatus("Não foi possível carregar o índice de busca.");
    }
  }, [layers.length, searchTerm]);

  const openSearchResult = useCallback(async (result: SearchHit) => {
    const source = await loadLayer(result.layer.id, "detail");
    const feature = source.getFeatures()[result.featureIndex];
    if (!feature) { setSearchStatus("A feição selecionada não está disponível."); return; }
    desiredVisibility.current[result.layer.id] = true;
    activeCompositionRef.current = null; setActiveComposition(null); setLayerOrder((current) => current.includes(result.layer.id) ? current : [result.layer.id, ...current]);
    setLayerState((current) => ({ ...current, [result.layer.id]: { ...current[result.layer.id], visible: true } }));
    const geometry = feature.getGeometry();
    if (geometry) mapRef.current?.getView().fit(geometry.getExtent(), { padding: [96, 96, 96, 96], duration: 300, maxZoom: 15 });
    setQueryHits([{ layer: result.layer, feature, attributes: publicAttributes(feature, result.layer) }]); setQueryIndex(0); setInfoLayer(null); setMobilePanel(null);
  }, [loadLayer]);

  function exportMap() {
    const map = mapRef.current;
    if (!map) return;
    setExportDialogOpen(false);
    setStatusMessage("Preparando composição cartográfica…");
    map.once("rendercomplete", () => {
      try {
        const size = map.getSize(); if (!size) throw new Error("Mapa sem dimensões.");
        const mapCanvas = document.createElement("canvas"); mapCanvas.width = size[0]; mapCanvas.height = size[1];
        const mapContext = mapCanvas.getContext("2d"); if (!mapContext) throw new Error("Canvas indisponível.");
        map.getViewport().querySelectorAll<HTMLCanvasElement>(".ol-layer canvas, canvas.ol-layer").forEach((canvas) => {
          if (!canvas.width) return;
          mapContext.globalAlpha = Number(canvas.parentElement?.style.opacity || canvas.style.opacity || 1);
          const matrix = canvas.style.transform.match(/^matrix\(([^)]+)\)$/)?.[1].split(",").map(Number);
          if (matrix?.length === 6) mapContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
          else mapContext.setTransform(1, 0, 0, 1, 0, 0);
          mapContext.drawImage(canvas, 0, 0);
        });
        mapContext.setTransform(1, 0, 0, 1, 0, 0); mapContext.globalAlpha = 1;
        const width = Math.max(1000, size[0]); const mapHeight = Math.round((size[1] / size[0]) * width);
        const legendBlocks = visibleLayers.map((layer) => { const descriptor = symbologyFor(layer); return { layer, descriptor, items: descriptor.items?.length ? descriptor.items : [{ value: "single", label: layer.titulo, color: descriptor.fill ?? descriptor.stroke ?? "#547e72" }] }; });
        const columns = width >= 1100 ? 2 : 1; const columnBlocks = Array.from({ length: columns }, () => [] as typeof legendBlocks); const columnHeights = Array(columns).fill(0) as number[];
        legendBlocks.forEach((block) => { const index = columnHeights.indexOf(Math.min(...columnHeights)); columnBlocks[index].push(block); columnHeights[index] += 28 + block.items.length * 20; });
        const footerHeight = Math.max(130, 58 + Math.max(...columnHeights, 0) + 58);
        const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = mapHeight + footerHeight;
        const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas indisponível.");
        context.fillStyle = "#f8fbf8"; context.fillRect(0, 0, width, canvas.height); context.drawImage(mapCanvas, 0, 0, width, mapHeight);
        context.fillStyle = "rgba(255,255,255,.94)"; context.fillRect(0, 0, width, 74); context.fillStyle = "#102a43"; context.font = "700 25px Arial";
        drawWrappedText(context, exportTitle || "WebGIS do Projeto Rio Potengi", 28, 34, width - 160, 28);
        const compositionName = activeComposition ? compositions[activeComposition].label : "Composição personalizada";
        context.font = "13px Arial"; context.fillStyle = "#36515a"; context.fillText(`${compositionName} · ${new Date().toLocaleDateString("pt-BR")} · ${baseMapLabels[baseMap]}`, 28, 59);
        context.fillStyle = "#102a43"; context.font = "700 16px Arial"; context.fillText("N", width - 60, 27);
        context.beginPath(); context.moveTo(width - 55, 34); context.lineTo(width - 43, 64); context.lineTo(width - 67, 64); context.closePath(); context.fill();
        const resolution = map.getView().getResolution() ?? 1;
        const metersPerPixel = getPointResolution(map.getView().getProjection(), resolution, map.getView().getCenter() ?? [0, 0]);
        const scale = Math.round(metersPerPixel / 0.00028);
        context.fillStyle = "rgba(255,255,255,.9)"; context.fillRect(24, mapHeight - 55, 190, 37); context.strokeStyle = "#102a43"; context.lineWidth = 3;
        context.beginPath(); context.moveTo(36, mapHeight - 29); context.lineTo(116, mapHeight - 29); context.stroke(); context.font = "12px Arial"; context.fillStyle = "#102a43";
        context.fillText(`Escala aproximada 1:${scale.toLocaleString("pt-BR")}`, 36, mapHeight - 37);
        const footerY = mapHeight; context.fillStyle = "#ffffff"; context.fillRect(0, footerY, width, footerHeight); context.fillStyle = "#102a43"; context.font = "700 16px Arial"; context.fillText("Legenda das camadas ativas", 28, footerY + 31);
        const columnWidth = (width - 56) / columns; columnBlocks.forEach((blocks, column) => { let y = footerY + 58; const x = 28 + column * columnWidth; blocks.forEach(({ layer, descriptor, items }) => { context.fillStyle = "#102a43"; context.font = "700 12px Arial"; context.fillText(layer.titulo, x, y); y += 18; items.forEach((item) => { context.globalAlpha = layerState[layer.id]?.opacity ?? 1; drawExportSymbol(context, descriptor, item.color, x, y); context.globalAlpha = 1; context.fillStyle = "#263f46"; context.font = "11px Arial"; context.fillText(items.length === 1 ? "Símbolo da camada" : item.label, x + 23, y - 1); y += 20; }); y += 10; }); });
        const creditsY = footerY + footerHeight - 40; context.fillStyle = "#e8f2ed"; context.fillRect(0, creditsY - 14, width, 54);
        context.fillStyle = "#36515a"; context.font = "12px Arial";
        drawWrappedText(context, `Fontes: Projeto Rio Potengi e fontes indicadas nas camadas. Base: ${baseCredits[baseMap]}. Créditos: Projeto Potengi · UFRN · Funpec.`, 28, creditsY, width - 56, 16);
        canvas.toBlob((blob) => {
          if (!blob) { setStatusMessage("A base atual bloqueou a exportação. Selecione a Base clara e tente novamente."); return; }
          const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "webgis-projeto-rio-potengi.png"; link.click();
          URL.revokeObjectURL(url); setStatusMessage("Mapa exportado em PNG com título, legenda, escala, norte, créditos e data.");
        }, "image/png");
      } catch { setStatusMessage("A base atual bloqueou a exportação. Selecione a Base clara e tente novamente."); }
    });
    map.renderSync();
  }

  if (catalogError) return <div className="webgis-fatal" role="alert">{catalogError}</div>;
  if (!catalog) return <div className="webgis-fatal" role="status">Preparando o WebGIS…</div>;

  return (
    <div ref={fullscreenElement} className={`potengi-webgis ${panelOpen ? "" : "is-panel-collapsed"}`}>
      <header className="webgis-intro">
        <div><span className="webgis-eyebrow"><MapPinned size={15} /> Território em detalhe</span><h1>WebGIS do Projeto Rio Potengi</h1><p>Explore o território da Bacia do Rio Potengi, os resultados do diagnóstico ambiental e as áreas de recuperação trabalhadas pelo projeto.</p></div>
        <div className="webgis-intro-meta" aria-label="Resumo do WebGIS"><strong>{catalog.totalCamadas}</strong><span>camadas integradas</span><i /><strong>5</strong><span>grupos temáticos</span></div>
      </header>
      <div className="webgis-workspace">
        <aside className={`webgis-sidebar ${mobilePanel === "layers" ? "is-mobile-open" : ""}`} aria-label="Painel de camadas">
          <div className="sidebar-heading"><div><Layers size={18} /><strong>Camadas</strong><span>{visibleLayers.length} ativas</span></div><button type="button" onClick={() => setPanelOpen((open) => !open)} aria-label={panelOpen ? "Recolher painel de camadas" : "Abrir painel de camadas"}>{panelOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button><button className="mobile-close" type="button" onClick={() => setMobilePanel(null)} aria-label="Fechar painel de camadas"><X size={18} /></button></div>
          <LayerCatalogPanel catalog={catalog} layers={layers} activeLayers={visibleLayers} layerState={layerState} onToggle={toggleLayer} onOpacity={changeOpacity} onZoom={zoomToLayer} onInfo={showLayerInfo} onData={openLayerData} onMove={moveActiveLayer} onRestoreOrder={restoreLayerOrder} onClearLayers={clearLayers} />
        </aside>
        <section className="webgis-map-stage" aria-label="Mapa interativo da Bacia do Rio Potengi">
          <div className="webgis-map-toolbar" role="toolbar" aria-label="Ferramentas cartográficas">
            <label className="webgis-composition-select"><span className="sr-only">Composição temática</span><select value={activeComposition ?? "custom"} onChange={(event) => { const value = event.target.value; if (value !== "custom") applyComposition(value as CompositionKey); }}><option value="custom">Composição personalizada</option>{Object.entries(compositions).map(([key, composition]) => <option key={key} value={key}>{composition.label}</option>)}</select></label>
            <label className="webgis-basemap-select"><span className="sr-only">Mapa-base</span><select value={baseMap} onChange={(event) => setBaseMap(event.target.value as BaseMapKey)}><option value="none">Sem base</option><option value="neutral">Base clara</option><option value="osm">OpenStreetMap</option><option value="satellite">Satélite</option></select></label>
            <div className="toolbar-group"><button type="button" onClick={() => zoomBy(1)} aria-label="Aumentar zoom" title="Aumentar zoom"><Plus size={18} /></button><button type="button" onClick={() => zoomBy(-1)} aria-label="Diminuir zoom" title="Diminuir zoom"><Minus size={18} /></button><button type="button" onClick={zoomToBasin} aria-label="Enquadrar a Bacia do Rio Potengi" title="Enquadrar bacia"><LocateFixed size={18} /></button><button type="button" onClick={useLocation} aria-label="Mostrar minha localização" title="Minha localização"><Crosshair size={18} /></button></div>
            <div className="toolbar-group measure-tools"><button className={measureMode === "LineString" ? "is-active" : ""} type="button" onClick={() => selectMeasure(measureMode === "LineString" ? "off" : "LineString")} aria-pressed={measureMode === "LineString"} aria-label="Medir distância" title="Medir distância"><Ruler size={18} /></button><button className={measureMode === "Polygon" ? "is-active" : ""} type="button" onClick={() => selectMeasure(measureMode === "Polygon" ? "off" : "Polygon")} aria-pressed={measureMode === "Polygon"} aria-label="Medir área" title="Medir área"><PanelBottomOpen size={18} /></button><button type="button" onClick={clearMapWork} aria-label="Limpar seleção e medições" title="Limpar"><Eraser size={18} /></button></div>
            <div className="toolbar-group toolbar-end"><button type="button" onClick={requestFullscreen} aria-label="Alternar tela cheia" title="Tela cheia"><Expand size={18} /></button><button type="button" onClick={() => setExportDialogOpen(true)} aria-label="Exportar mapa em PNG" title="Exportar PNG"><Download size={18} /></button></div>
          </div>
          <div ref={mapElement} className={`webgis-map-canvas ${baseMap === "neutral" ? "is-neutral-basemap" : ""} ${baseMap === "none" ? "is-no-basemap" : ""}`} />
          {activeComposition === "recovery" && <nav className="recovery-locations" aria-label="Locais de recuperação">{recoveryLocations.map((location) => <button type="button" key={location.id} onClick={() => focusRecoveryLocation(location)}><MapPinned size={14} />{location.label}</button>)}</nav>}
          {layerState.vulnerabilidade?.status === "loading" && <div className="map-loading" role="status"><span /> Carregando vulnerabilidade ambiental…</div>}
          <FeatureSearchPanel mobileOpen={mobilePanel === "search"} term={searchTerm} status={searchStatus} municipalities={municipalities} municipality={municipalityFilter} results={filteredSearchResults} onClose={closeMobilePanel} onTerm={changeSearchTerm} onRun={runSearch} onMunicipality={changeMunicipality} onOpenResult={openSearchResult} />
          {(activeHit || infoLayer) && <aside className="feature-panel" aria-label={activeHit ? "Consulta de atributos" : "Informações da camada"}><button className="feature-panel-close" type="button" onClick={() => { setQueryHits([]); setInfoLayer(null); setInfoSource("Projeto Rio Potengi e fontes indicadas na camada"); selectionSource.current.clear(); }} aria-label="Fechar painel de informações"><X size={18} /></button>{activeHit ? <><span className="panel-kicker"><MousePointer2 size={14} /> Feição consultada</span><h2>{activeHit.layer.titulo}</h2>{queryHits.length > 1 && <div className="overlap-nav"><button type="button" onClick={() => setQueryIndex((queryIndex - 1 + queryHits.length) % queryHits.length)} aria-label="Feição anterior"><ChevronLeft size={16} /></button><span>{queryIndex + 1} de {queryHits.length} sobrepostas</span><button type="button" onClick={() => setQueryIndex((queryIndex + 1) % queryHits.length)} aria-label="Próxima feição"><ChevronRight size={16} /></button></div>}{activeHit.attributes.length ? <dl>{activeHit.attributes.map((attribute) => <div key={attribute.key}><dt>{attribute.label}</dt><dd>{attribute.value}</dd></div>)}</dl> : <p>Esta feição não possui valores públicos preenchidos.</p>}</> : infoLayer && <><span className="panel-kicker"><CircleHelp size={14} /> Informações da camada</span><h2>{infoLayer.titulo}</h2><dl><div><dt>Grupo</dt><dd>{infoLayer.groupTitle}</dd></div><div><dt>Geometria</dt><dd>{infoLayer.geometria}</dd></div><div><dt>Fonte</dt><dd>{infoSource}</dd></div><div><dt>Campos consultáveis</dt><dd>{infoLayer.camposConsulta.map(labelForField).join(", ")}</dd></div>{infoLayer.minZoom && <div><dt>Escala de detalhe</dt><dd>Visível a partir do zoom {infoLayer.minZoom}</dd></div>}</dl></>}</aside>}
          <MapLegend layers={visibleLayers} open={legendOpen} onToggle={toggleLegend} />
          <LayerDataDrawer layer={dataLayer} table={layerTable} loading={tableLoading} query={tableQuery} page={tablePage} onQuery={changeTableQuery} onPage={setTablePage} onLocate={locateTableRow} onClose={closeLayerData} />
          <div className="map-readouts"><span ref={coordinatesElement}>Lon — | Lat —</span><span>{measureText}</span></div><div className="map-credits">{baseCredits[baseMap]} · Dados: Projeto Rio Potengi</div>
          {statusMessage && <div className="map-toast" role="status"><Info size={15} />{statusMessage}<button type="button" onClick={() => setStatusMessage("")} aria-label="Fechar aviso"><X size={14} /></button></div>}
          <div className="mobile-map-actions" aria-label="Painéis do WebGIS"><button type="button" onClick={() => setMobilePanel("layers")}><Layers size={18} />Camadas</button><button type="button" onClick={() => setMobilePanel("search")}><Search size={18} />Busca</button></div>
        </section>
      </div>
      <footer className="webgis-footer-note"><p>As camadas reúnem dados produzidos e organizados pelo Projeto Rio Potengi a partir das fontes indicadas em cada ficha.</p></footer>
      <ExportDialog open={exportDialogOpen} title={exportTitle} onTitle={setExportTitle} onCancel={cancelExport} onConfirm={exportMap} />
    </div>
  );
}
