"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Feature, { type FeatureLike } from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import { defaults as defaultControls } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import type Geometry from "ol/geom/Geometry";
import Point from "ol/geom/Point";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { defaults as defaultInteractions } from "ol/interaction";
import OSM from "ol/source/OSM";
import ImageStatic from "ol/source/ImageStatic";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";
import { fromLonLat, transformExtent } from "ol/proj";
import { ChevronDown, LocateFixed, X } from "lucide-react";

type ContextKey = "territorio" | "diagnostico" | "recuperacao" | "saneamento";
type BaseKey = "none" | "neutral" | "osm" | "satellite";
type GeometryKind = "polygon" | "line" | "point";
type LegendItem = { label: string; color: string; stroke?: string; kind?: GeometryKind };
type PreviewLayer = {
  id: string; title: string; url: string; kind: GeometryKind; opacity: number;
  fill?: string; stroke: string; strokeWidth: number; lineDash?: number[]; radius?: number; field?: string;
  classes?: Array<{ value: string | number; label: string; color: string }>;
  labelField?: string;
  raster?: { imageUrl: string; metadataUrl: string };
};
type QueryCandidate = { id: string; layer: string; properties: Array<{ label: string; value: string }> };
type QueryResult = { activeId: string; candidates: QueryCandidate[] } | null;

const layers: PreviewLayer[] = [
  { id: "bacia", title: "Limite da Bacia do Rio Potengi", url: "/data/webgis/bacia-rio-potengi.geojson", kind: "polygon", opacity: 1, fill: "rgba(51,65,71,.025)", stroke: "#334147", strokeWidth: 2.2 },
  { id: "municipios", title: "Municípios", url: "/data/webgis/municipios.geojson", kind: "polygon", opacity: .8, fill: "rgba(255,255,255,.02)", stroke: "#64748b", strokeWidth: .8 },
  { id: "rios", title: "Rede hidrográfica", url: "/data/webgis/rios.geojson", kind: "line", opacity: .88, stroke: "#3cb6d6", strokeWidth: .9 },
  { id: "massas-agua", title: "Massas d’água", url: "/data/webgis/massas-agua.geojson", kind: "polygon", opacity: .86, fill: "rgba(31,103,153,.72)", stroke: "#15577e", strokeWidth: .9 },
  {
    id: "vulnerabilidade", title: "Vulnerabilidade ambiental", url: "/data/webgis/vulnerabilidade.geojson", kind: "polygon", opacity: .68,
    stroke: "rgba(36,57,54,.25)", strokeWidth: .35, field: "classe",
    raster: { imageUrl: "/data/webgis/vulnerabilidade-geral.png", metadataUrl: "/data/webgis/vulnerabilidade-geral-raster.json" },
    classes: [
      { value: 1, label: "Muito baixa", color: "#1a9850" }, { value: 2, label: "Baixa", color: "#91cf60" },
      { value: 3, label: "Moderada", color: "#fee08b" }, { value: 4, label: "Alta", color: "#fc8d59" },
      { value: 5, label: "Muito alta", color: "#d73027" }
    ]
  },
  { id: "cercamento-nascente", title: "Nascentes do Potengi", url: "/data/webgis/cercamento-nascente.geojson", kind: "polygon", opacity: .85, fill: "rgba(0,120,108,.35)", stroke: "#00786c", strokeWidth: 2 },
  { id: "trilha-nascente", title: "Trilha de acesso à nascente", url: "/data/webgis/trilha-nascente.geojson", kind: "line", opacity: .78, stroke: "#a16207", strokeWidth: 2, lineDash: [4, 4] },
  { id: "area-plantio-eloy", title: "Açude Eloy de Souza", url: "/data/webgis/area-plantio-eloy.geojson", kind: "polygon", opacity: .78, fill: "rgba(245,183,0,.5)", stroke: "#8a6500", strokeWidth: 1.6 },
  { id: "cercamento-eloy", title: "Cercamentos — Açude Eloy de Souza", url: "/data/webgis/cercamento-eloy.geojson", kind: "line", opacity: 1, stroke: "#7c3aed", strokeWidth: 2.2, lineDash: [8, 5] },
  { id: "corredor-ecologico-eloy-area", title: "Corredor ecológico — área", url: "/data/webgis/corredor-ecologico-eloy-area.geojson", kind: "polygon", opacity: .78, fill: "rgba(5,150,105,.42)", stroke: "#047857", strokeWidth: 1.8 },
  { id: "corredor-ecologico-eloy-eixo", title: "Corredor ecológico — eixo", url: "/data/webgis/corredor-ecologico-eloy-eixo.geojson", kind: "line", opacity: .78, stroke: "#047857", strokeWidth: 2.2, lineDash: [7, 4] },
  { id: "porteiras-eloy", title: "Porteiras — Açude Eloy de Souza", url: "/data/webgis/porteiras-eloy.geojson", kind: "point", opacity: .78, fill: "#713f12", stroke: "#ffffff", strokeWidth: 1.2, radius: 5 },
  { id: "area-mundo-novo", title: "Fazenda Mundo Novo", url: "/data/webgis/area-mundo-novo.geojson", kind: "polygon", opacity: .82, fill: "rgba(236,72,153,.4)", stroke: "#be185d", strokeWidth: 1.8 },
  { id: "recuperacao-eaj", title: "Escola Agrícola de Jundiaí", url: "/data/webgis/recuperacao-eaj.geojson", kind: "polygon", opacity: .78, fill: "rgba(217,119,6,.45)", stroke: "#92400e", strokeWidth: 1.8 },
  { id: "nucleacao-eaj", title: "Nucleação — Escola Agrícola de Jundiaí", url: "/data/webgis/nucleacao-eaj.geojson", kind: "line", opacity: .95, stroke: "#0d9488", strokeWidth: 1.6 },
  { id: "areas-descobertas-eaj", title: "Áreas descobertas — Escola Agrícola de Jundiaí", url: "/data/webgis/areas-descobertas-eaj.geojson", kind: "polygon", opacity: .62, fill: "rgba(148,163,184,.42)", stroke: "#475569", strokeWidth: 1.2 },
  { id: "drenagens-eaj", title: "Drenagens — Escola Agrícola de Jundiaí", url: "/data/webgis/drenagens-eaj.geojson", kind: "line", opacity: .78, stroke: "#0284c7", strokeWidth: 1.4 },
  { id: "recovery-locations", title: "Áreas de recuperação", url: "/data/webgis/locais-recuperacao.json", kind: "point", opacity: 1, fill: "#f2c84b", stroke: "#083e4a", strokeWidth: 1.8, radius: 5.5, labelField: "label" },
  {
    id: "tratamento-esgoto", title: "Tratamento de esgoto", url: "/data/webgis/tratamento-esgoto.geojson", kind: "polygon", opacity: .62,
    stroke: "rgba(36,57,54,.28)", strokeWidth: .5, field: "situacao_tratamento",
    classes: [
      { value: "0 - 60%", label: "0 – 60%", color: "#0f766e" }, { value: "60,01 - 80%", label: "60,01 – 80%", color: "#d97706" },
      { value: "80,01 - 100%", label: "80,01 – 100%", color: "#7c3aed" }, { value: "Sem Tratamento", label: "Sem tratamento", color: "#0369a1" }
    ]
  },
  { id: "lixoes", title: "Lixões identificados", url: "/data/webgis/lixoes.geojson", kind: "point", opacity: 1, fill: "#9f1239", stroke: "#ffffff", strokeWidth: 1.2, radius: 5 },
  {
    id: "qualidade-residuos", title: "Disposição de resíduos sólidos", url: "/data/webgis/qualidade-residuos.geojson", kind: "polygon", opacity: .78,
    stroke: "rgba(36,57,54,.28)", strokeWidth: .5, field: "enquadramento",
    classes: [
      { value: "ADEQUADO", label: "Adequado", color: "#7c3aed" }, { value: "CONTROLADO", label: "Controlado", color: "#b45309" },
      { value: "INADEQUADO", label: "Inadequado", color: "#4d7c0f" }
    ]
  }
];

const contexts: Array<{ key: ContextKey; label: string; base: BaseKey; layerIds: string[] }> = [
  { key: "territorio", label: "Território", base: "satellite", layerIds: ["bacia", "municipios", "rios", "massas-agua"] },
  { key: "diagnostico", label: "Diagnóstico", base: "neutral", layerIds: ["vulnerabilidade", "massas-agua", "municipios", "rios", "bacia"] },
  { key: "recuperacao", label: "Recuperação", base: "satellite", layerIds: ["municipios", "cercamento-nascente", "area-plantio-eloy", "area-mundo-novo", "recuperacao-eaj", "recovery-locations", "bacia"] },
  { key: "saneamento", label: "Saneamento", base: "neutral", layerIds: ["tratamento-esgoto", "qualidade-residuos", "municipios", "rios", "lixoes", "bacia"] }
];

const recoveryLocations = [
  { id: "nascente-potengi", label: "Nascentes do Potengi", layerIds: ["cercamento-nascente", "trilha-nascente"], extent: [-36.392681, -6.045715, -36.389762, -6.043676] },
  { id: "acude-eloy", label: "Açude Eloy de Souza", layerIds: ["area-plantio-eloy", "cercamento-eloy", "corredor-ecologico-eloy-area", "corredor-ecologico-eloy-eixo", "porteiras-eloy"], extent: [-36.352042, -6.044066, -36.347319, -6.039758] },
  { id: "fazenda-mundo-novo", label: "Fazenda Mundo Novo", layerIds: ["area-mundo-novo"], extent: [-36.1823, -5.927462, -36.180385, -5.925268] },
  { id: "eaj", label: "Escola Agrícola de Jundiaí", layerIds: ["recuperacao-eaj", "nucleacao-eaj", "areas-descobertas-eaj", "drenagens-eaj"], extent: [-35.396537, -5.907674, -35.335742, -5.87332] }
];

function styleFor(config: PreviewLayer) {
  return (feature: FeatureLike) => {
    const classified = config.classes?.find((item) => String(item.value) === String(feature.get(config.field ?? "")));
    const color = classified?.color ?? config.fill;
    return new Style({
      stroke: new Stroke({ color: config.stroke, width: config.strokeWidth, lineDash: config.lineDash }),
      fill: config.kind === "polygon" ? new Fill({ color: color ?? "rgba(255,255,255,.12)" }) : undefined,
      image: config.kind === "point" ? new CircleStyle({ radius: config.radius ?? 4.5, fill: new Fill({ color: color ?? config.stroke }), stroke: new Stroke({ color: config.stroke, width: config.strokeWidth }) }) : undefined,
      text: config.labelField ? new Text({ text: String(feature.get(config.labelField) ?? ""), font: "700 11px Segoe UI", overflow: true, offsetY: -14, fill: new Fill({ color: "#15383f" }), stroke: new Stroke({ color: "rgba(255,255,255,.96)", width: 3.5 }) }) : undefined
    });
  };
}

function legendFor(config: PreviewLayer): LegendItem[] {
  if (config.classes) return config.classes.map((item) => ({ label: config.id === "vulnerabilidade" ? item.label : `${config.title} · ${item.label}`, color: item.color, stroke: config.stroke, kind: config.kind }));
  return [{ label: config.title, color: config.fill ?? config.stroke, stroke: config.stroke, kind: config.kind }];
}

function layerZIndex(config: PreviewLayer) {
  if (config.id === "bacia") return 60;
  if (config.kind === "point" || config.labelField) return 50;
  if (config.kind === "line") return 40;
  if (config.id === "massas-agua") return 30;
  if (config.id === "municipios") return 20;
  return 10;
}

function formatValue(value: unknown) {
  if (typeof value === "number") return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return String(value);
}

export default function HomeWebgisPreview() {
  const element = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const layerRefs = useRef<Record<string, VectorLayer<VectorSource<Feature<Geometry>>>>>({});
  const rasterLayerRefs = useRef<Record<string, ImageLayer<ImageStatic>>>({});
  const baseLayersRef = useRef<{ neutral?: TileLayer<OSM>; osm?: TileLayer<OSM>; satellite?: TileLayer<XYZ> }>({});
  const loadedRef = useRef(new Set<string>());
  const visibleIdsRef = useRef(new Set<string>());
  const [activeContext, setActiveContext] = useState<ContextKey>("territorio");
  const [activeBase, setActiveBase] = useState<BaseKey>("satellite");
  const [activeRecovery, setActiveRecovery] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);
  const [query, setQuery] = useState<QueryResult>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const activeLayerIds = useMemo(() => {
    const contextIds = contexts.find((context) => context.key === activeContext)?.layerIds ?? [];
    if (activeContext !== "recuperacao") return contextIds;
    const locationIds = recoveryLocations.find((location) => location.id === activeRecovery)?.layerIds
      ?? ["cercamento-nascente", "area-plantio-eloy", "area-mundo-novo", "recuperacao-eaj", "recovery-locations"];
    return Array.from(new Set(["municipios", "bacia", ...locationIds]));
  }, [activeContext, activeRecovery]);
  const activeLegend = useMemo(() => activeLayerIds.flatMap((id) => legendFor(layers.find((layer) => layer.id === id)!)), [activeLayerIds]);
  const activeLegendGroups = useMemo(() => {
    const territoryIds = new Set(["bacia", "municipios", "rios", "massas-agua"]);
    const territory = activeLayerIds.filter((id) => territoryIds.has(id)).flatMap((id) => legendFor(layers.find((layer) => layer.id === id)!));
    const thematic = activeLayerIds.filter((id) => !territoryIds.has(id) && id !== "recovery-locations").flatMap((id) => legendFor(layers.find((layer) => layer.id === id)!));
    const thematicLabel = activeContext === "diagnostico" ? "Vulnerabilidade ambiental" : activeContext === "recuperacao" ? "Recuperação" : "Saneamento";
    return [territory.length ? { label: "Território", items: territory } : undefined, thematic.length ? { label: thematicLabel, items: thematic } : undefined].filter(Boolean) as Array<{ label: string; items: LegendItem[] }>;
  }, [activeContext, activeLayerIds]);

  useEffect(() => {
    if (!element.current || mapRef.current) return;
    const loadedLayers = loadedRef.current;
    const neutral = new TileLayer({ className: "rpf-home-basemap-neutral", source: new OSM(), visible: false, opacity: .72 });
    const osm = new TileLayer({ source: new OSM(), visible: false, opacity: 1 });
    const satellite = new TileLayer({
      className: "rpf-home-basemap-satellite",
      source: new XYZ({ url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attributions: "Tiles © Esri — Esri, Maxar, Earthstar Geographics e comunidade GIS", crossOrigin: "anonymous" }),
      visible: true, opacity: .9
    });
    baseLayersRef.current = { neutral, osm, satellite };
    const map = new Map({
      target: element.current,
      controls: defaultControls({ attribution: true, rotate: false }),
      interactions: defaultInteractions({ altShiftDragRotate: false, pinchRotate: false }),
      layers: [neutral, osm, satellite],
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      view: new View({ center: [-3990000, -640000], zoom: 8, minZoom: 6, maxZoom: 19 })
    });
    map.on("singleclick", (event) => {
      const candidates: QueryCandidate[] = [];
      map.forEachFeatureAtPixel(event.pixel, (feature, candidateLayer) => {
        const config = layers.find((layer) => layerRefs.current[layer.id] === candidateLayer);
        if (!config || candidates.some((candidate) => candidate.id === config.id)) return undefined;
        const properties = Object.entries(feature.getProperties())
          .filter(([key, value]) => key !== "geometry" && value !== null && value !== undefined && String(value).trim() !== "")
          .slice(0, 4)
          .map(([key, value]) => ({ label: key.replace(/_/g, " "), value: formatValue(value) }));
        candidates.push({ id: config.id, layer: config.title, properties });
        return undefined;
      }, { hitTolerance: 5 });
      candidates.sort((first, second) => {
        const firstLayer = layers.find((layer) => layer.id === first.id);
        const secondLayer = layers.find((layer) => layer.id === second.id);
        const priority = (layer?: PreviewLayer) => layer?.kind === "point" ? 3 : layer?.classes ? 2 : layer?.kind === "line" ? 1 : 0;
        return priority(secondLayer) - priority(firstLayer);
      });
      setQuery(candidates.length ? { activeId: candidates[0].id, candidates } : null);
    });
    mapRef.current = map;
    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      layerRefs.current = {};
      rasterLayerRefs.current = {};
      baseLayersRef.current = {};
      loadedLayers.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    setQuery(null);
    visibleIdsRef.current = new Set(activeLayerIds);
    Object.entries(layerRefs.current).forEach(([id, layer]) => layer.setVisible(activeLayerIds.includes(id)));
    Object.entries(rasterLayerRefs.current).forEach(([id, layer]) => layer.setVisible(activeLayerIds.includes(id)));

    Promise.all(activeLayerIds.map(async (id) => {
      if (loadedRef.current.has(id)) return;
      const config = layers.find((layer) => layer.id === id);
      if (!config) return;
      if (config.raster) {
        const metadataResponse = await fetch(config.raster.metadataUrl);
        if (!metadataResponse.ok) throw new Error(`Falha ao carregar ${config.id}`);
        const metadata = await metadataResponse.json() as { extent: [number, number, number, number] };
        const raster = new ImageLayer({
          source: new ImageStatic({
            url: config.raster.imageUrl,
            imageExtent: metadata.extent,
            projection: "EPSG:3857",
            interpolate: true,
            crossOrigin: "anonymous"
          }),
          opacity: config.opacity,
          visible: true,
          zIndex: layerZIndex(config)
        });
        rasterLayerRefs.current[id] = raster;
        map.addLayer(raster);
        loadedRef.current.add(id);
        raster.setVisible(visibleIdsRef.current.has(id));
        return;
      }
      let vector = layerRefs.current[id];
      if (!vector) {
        vector = new VectorLayer({
          source: new VectorSource<Feature<Geometry>>(),
          opacity: config.opacity,
          style: styleFor(config),
          zIndex: layerZIndex(config),
          renderBuffer: 24,
          updateWhileAnimating: false,
          updateWhileInteracting: false
        });
        layerRefs.current[id] = vector;
        map.addLayer(vector);
      }
      vector.setVisible(true);
      const response = await fetch(config.url);
      if (!response.ok) throw new Error(`Falha ao carregar ${config.id}`);
      const data = await response.json();
      const features = config.id === "recovery-locations"
        ? (data.locations as Array<{ coordinate: [number, number]; label: string }>).map((location) => new Feature<Geometry>({ geometry: new Point(fromLonLat(location.coordinate)), label: location.label }))
        : new GeoJSON().readFeatures(data, { featureProjection: "EPSG:3857" }) as Feature<Geometry>[];
      vector.getSource()?.addFeatures(features);
      loadedRef.current.add(id);
      vector.setVisible(visibleIdsRef.current.has(id));
    }))
      .then(() => {
        if (cancelled) return;
        const recovery = activeContext === "recuperacao" ? recoveryLocations.find((location) => location.id === activeRecovery) : undefined;
        if (recovery?.extent) {
          map.getView().fit(transformExtent(recovery.extent, "EPSG:4326", "EPSG:3857"), { padding: [86, 70, 86, 70], duration: 320, maxZoom: 17 });
          return;
        }
        const extent = layerRefs.current.bacia?.getSource()?.getExtent();
        if (extent) map.getView().fit(extent, { padding: [58, 58, 54, 58], duration: 260 });
      })
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [activeContext, activeLayerIds, activeRecovery]);

  useEffect(() => {
    baseLayersRef.current.neutral?.setVisible(activeBase === "neutral");
    baseLayersRef.current.osm?.setVisible(activeBase === "osm");
    baseLayersRef.current.satellite?.setVisible(activeBase === "satellite");
  }, [activeBase]);

  function selectContext(key: ContextKey) {
    const context = contexts.find((item) => item.key === key);
    setActiveContext(key);
    setActiveRecovery(null);
    if (context) setActiveBase(context.base);
  }

  function fitBasin() {
    if (activeContext === "recuperacao") setActiveRecovery(null);
    const extent = layerRefs.current.bacia?.getSource()?.getExtent();
    if (extent) mapRef.current?.getView().fit(extent, { padding: [58, 58, 54, 58], duration: 420 });
  }

  const activeQuery = query?.candidates.find((candidate) => candidate.id === query.activeId);

  return (
    <div className="rpf-map-window">
      <div className="rpf-map-toolbar">
        <div className="rpf-map-contexts" aria-label="Leituras do mapa">
          {contexts.map((context) => (
            <button key={context.key} type="button" className={activeContext === context.key ? "active" : ""} onClick={() => selectContext(context.key)}>{context.label}</button>
          ))}
        </div>
        <div className="rpf-map-toolbar-actions">
          <label className="rpf-map-base">
            <span>Base</span>
            <select value={activeBase} onChange={(event) => setActiveBase(event.target.value as BaseKey)} aria-label="Base cartográfica">
              <option value="none">Sem base</option><option value="neutral">Base clara</option><option value="osm">OpenStreetMap</option><option value="satellite">Satélite</option>
            </select>
          </label>
          <button type="button" className="rpf-map-fit" onClick={fitBasin} aria-label="Enquadrar bacia"><LocateFixed size={16} aria-hidden="true" /> Enquadrar bacia</button>
        </div>
      </div>

      <div ref={element} className="rpf-map-canvas" aria-label="Mapa interativo da Bacia do Rio Potengi" />
      {activeContext === "recuperacao" && (
        <nav className="rpf-recovery-locations" aria-label="Áreas de recuperação">
          {recoveryLocations.map((location) => (
            <button key={location.id} type="button" className={activeRecovery === location.id ? "active" : ""} onClick={() => setActiveRecovery(location.id)}>{location.label}</button>
          ))}
        </nav>
      )}
      {loading && <div className="rpf-map-status">Carregando leitura…</div>}
      {loadError && <div className="rpf-map-status rpf-map-status-error">Algumas camadas não puderam ser carregadas.</div>}
      <div className={`rpf-map-legend ${legendOpen ? "is-open" : ""}`} aria-label="Legenda da leitura ativa">
        <button type="button" onClick={() => setLegendOpen((open) => !open)} aria-expanded={legendOpen}>
          <span>Legenda</span><small>{activeLegend.length}</small><ChevronDown size={15} aria-hidden="true" />
        </button>
        {legendOpen && <div className="rpf-map-legend-items">
          {activeLegendGroups.map((group) => <div className="rpf-map-legend-group" key={group.label}>
            <strong>{group.label}</strong>
            {group.items.map((item) => (
              <span key={`${item.label}-${item.color}`}><i className={`is-${item.kind ?? "polygon"}`} style={{ background: item.color, borderColor: item.stroke ?? item.color }} />{item.label}</span>
            ))}
          </div>)}
        </div>}
      </div>
      {query && activeQuery && (
        <aside className="rpf-map-query" aria-live="polite">
          <button type="button" onClick={() => setQuery(null)} aria-label="Fechar consulta"><X size={15} aria-hidden="true" /></button>
          {query.candidates.length > 1 && (
            <nav className="rpf-map-query-layers" aria-label="Camadas disponíveis neste ponto">
              {query.candidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className={candidate.id === query.activeId ? "active" : ""}
                  onClick={() => setQuery((current) => current ? { ...current, activeId: candidate.id } : current)}
                >
                  {candidate.layer}
                </button>
              ))}
            </nav>
          )}
          <strong>{activeQuery.layer}</strong>
          {activeQuery.properties.length ? (
            <dl>{activeQuery.properties.map((item) => <div key={`${item.label}-${item.value}`}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
          ) : <p className="rpf-map-query-empty">Sem informações adicionais.</p>}
        </aside>
      )}
    </div>
  );
}
