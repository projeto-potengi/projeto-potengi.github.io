"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import { defaults as defaultControls } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { defaults as defaultInteractions } from "ol/interaction";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { LocateFixed, X } from "lucide-react";
import { layerConfigs, type LayerConfig } from "@/src/data/layers";

type ContextKey = "territorio" | "diagnostico" | "recuperacao";
type BaseKey = "mapa" | "satelite" | "sem-base";
type QueryResult = { layer: string; properties: Array<{ label: string; value: string }> } | null;

const contexts: Array<{ key: ContextKey; label: string; layerIds: string[] }> = [
  { key: "territorio", label: "Território", layerIds: ["limite-bacia", "rios"] },
  {
    key: "diagnostico",
    label: "Diagnóstico",
    layerIds: ["limite-bacia", "rios", "areas-prioritarias-alta", "areas-prioritarias-extrema"]
  },
  { key: "recuperacao", label: "Recuperação", layerIds: ["limite-bacia", "rios", "app-wallace", "cercas", "coletas"] }
];

const homeLayers = Array.from(new Set(contexts.flatMap((context) => context.layerIds)))
  .map((id) => layerConfigs.find((layer) => layer.id === id))
  .filter(Boolean) as LayerConfig[];

function previewStyle(layer: LayerConfig) {
  const isBasin = layer.id === "limite-bacia";
  const isRiver = layer.id === "rios";

  return new Style({
    stroke: new Stroke({
      color: isBasin ? "#087b94" : isRiver ? "#1597bd" : layer.color,
      width: isBasin ? 2.1 : isRiver ? 1.35 : layer.kind === "line" ? 2.1 : 1.5
    }),
    fill:
      layer.kind === "polygon"
        ? new Fill({ color: isBasin ? "rgba(226,243,237,0.05)" : layer.fill ?? "rgba(255,255,255,0.16)" })
        : undefined,
    image:
      layer.kind === "point"
        ? new CircleStyle({
            radius: 4.5,
            fill: new Fill({ color: layer.color }),
            stroke: new Stroke({ color: "#ffffff", width: 1.4 })
          })
        : undefined
  });
}

function labelForField(key: string, layer: LayerConfig) {
  if (layer.fieldLabels?.[key]) return layer.fieldLabels[key];
  if (key === "gridcode") return "Classe";
  if (key === "Shape_Area") return "Área";
  if (key === "Shape_Leng") return "Comprimento";
  return key.replace(/_/g, " ");
}

function formatValue(value: unknown) {
  if (typeof value === "number") return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return String(value);
}

export default function HomeWebgisPreview() {
  const element = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const layersRef = useRef<Record<string, VectorLayer<VectorSource>>>({});
  const baseLayersRef = useRef<{ mapa?: TileLayer<OSM>; satelite?: TileLayer<XYZ> }>({});
  const [activeContext, setActiveContext] = useState<ContextKey>("territorio");
  const [activeBase, setActiveBase] = useState<BaseKey>("mapa");
  const [query, setQuery] = useState<QueryResult>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const activeLayerIds = useMemo(
    () => contexts.find((context) => context.key === activeContext)?.layerIds ?? [],
    [activeContext]
  );
  const activeLegend = homeLayers.filter((layer) => activeLayerIds.includes(layer.id));

  useEffect(() => {
    if (!element.current || mapRef.current) return;

    const mapBase = new TileLayer({
      source: new OSM(),
      visible: true,
      opacity: 0.62
    });

    const satelliteBase = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attributions: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
        crossOrigin: "anonymous"
      }),
      visible: false,
      opacity: 0.88
    });

    baseLayersRef.current = { mapa: mapBase, satelite: satelliteBase };

    const vectorLayers = homeLayers.map((config) => {
      const vector = new VectorLayer({
        source: new VectorSource(),
        visible: contexts[0].layerIds.includes(config.id),
        opacity: config.id === "limite-bacia" || config.id === "rios" ? 1 : Math.max(config.opacity, 0.72),
        style: previewStyle(config)
      });
      layersRef.current[config.id] = vector;
      return { config, vector };
    });

    const map = new Map({
      target: element.current,
      controls: defaultControls({ attribution: true, rotate: false }),
      interactions: defaultInteractions({ altShiftDragRotate: false, pinchRotate: false }),
      layers: [mapBase, satelliteBase, ...vectorLayers.map(({ vector }) => vector)],
      view: new View({ center: [-3990000, -640000], zoom: 8, minZoom: 6, maxZoom: 14 })
    });

    map.on("singleclick", (event) => {
      let nextQuery: QueryResult = null;
      map.forEachFeatureAtPixel(
        event.pixel,
        (feature, candidateLayer) => {
          const config = homeLayers.find((layer) => layersRef.current[layer.id] === candidateLayer);
          if (!config) return false;
          const properties = Object.entries(feature.getProperties())
            .filter(([key, value]) => key !== "geometry" && value !== null && value !== undefined && String(value).trim() !== "")
            .slice(0, 4)
            .map(([key, value]) => ({ label: labelForField(key, config), value: formatValue(value) }));
          nextQuery = { layer: config.title, properties };
          return true;
        },
        { hitTolerance: 5 }
      );
      setQuery(nextQuery);
    });

    Promise.all(
      vectorLayers.map(async ({ config, vector }) => {
        const response = await fetch(config.url);
        if (!response.ok) throw new Error(`Falha ao carregar ${config.id}`);
        const data = await response.json();
        const features = new GeoJSON().readFeatures(data, { featureProjection: "EPSG:3857" });
        vector.getSource()?.addFeatures(features);
        return { config, vector };
      })
    )
      .then((loadedLayers) => {
        const basin = loadedLayers.find(({ config }) => config.id === "limite-bacia");
        const extent = basin?.vector.getSource()?.getExtent();
        if (extent) map.getView().fit(extent, { padding: [48, 54, 44, 54], duration: 0 });
        setLoadError(false);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));

    mapRef.current = map;
    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      layersRef.current = {};
      baseLayersRef.current = {};
    };
  }, []);

  useEffect(() => {
    Object.entries(layersRef.current).forEach(([id, layer]) => {
      layer.setVisible(activeLayerIds.includes(id));
    });
    setQuery(null);
  }, [activeLayerIds]);

  useEffect(() => {
    const { mapa, satelite } = baseLayersRef.current;
    mapa?.setVisible(activeBase === "mapa");
    satelite?.setVisible(activeBase === "satelite");
  }, [activeBase]);

  function fitBasin() {
    const extent = layersRef.current["limite-bacia"]?.getSource()?.getExtent();
    if (extent) mapRef.current?.getView().fit(extent, { padding: [48, 54, 44, 54], duration: 420 });
  }

  return (
    <div className="rpf-map-window">
      <div className="rpf-map-toolbar">
        <div className="rpf-map-contexts" aria-label="Contextos do mapa">
          {contexts.map((context) => (
            <button
              key={context.key}
              type="button"
              className={activeContext === context.key ? "active" : ""}
              onClick={() => setActiveContext(context.key)}
            >
              {context.label}
            </button>
          ))}
        </div>

        <div className="rpf-map-toolbar-actions">
          <label className="rpf-map-base">
            <span>Base</span>
            <select value={activeBase} onChange={(event) => setActiveBase(event.target.value as BaseKey)} aria-label="Base cartográfica">
              <option value="mapa">Mapa</option>
              <option value="satelite">Satélite</option>
              <option value="sem-base">Sem base</option>
            </select>
          </label>
          <button type="button" className="rpf-map-fit" onClick={fitBasin} aria-label="Enquadrar bacia">
            <LocateFixed size={16} aria-hidden="true" />
            Enquadrar bacia
          </button>
        </div>
      </div>

      <div ref={element} className="rpf-map-canvas" aria-label="Mapa interativo da Bacia do Rio Potengi" />

      {loading && <div className="rpf-map-status">Carregando camadas do projeto…</div>}
      {loadError && <div className="rpf-map-status rpf-map-status-error">Algumas camadas não puderam ser carregadas.</div>}

      <div className="rpf-map-legend" aria-label="Camadas visíveis">
        {activeLegend.map((layer) => (
          <span key={layer.id}>
            <i style={{ background: layer.fill ?? layer.color, borderColor: layer.color }} />
            {layer.title}
          </span>
        ))}
      </div>

      {query && (
        <aside className="rpf-map-query" aria-live="polite">
          <button type="button" onClick={() => setQuery(null)} aria-label="Fechar consulta">
            <X size={15} aria-hidden="true" />
          </button>
          <strong>{query.layer}</strong>
          <dl>
            {query.properties.map((item) => (
              <div key={`${item.label}-${item.value}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </div>
  );
}
