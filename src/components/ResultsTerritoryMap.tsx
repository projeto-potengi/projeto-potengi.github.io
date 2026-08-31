"use client";

import { useEffect, useRef, useState } from "react";
import Feature from "ol/Feature";
import OLMap from "ol/Map";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import Point from "ol/geom/Point";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { createEmpty, extend, getCenter, isEmpty } from "ol/extent";
import {
  Droplets,
  Layers3,
  Map as MapIcon,
  MapPinned,
  Maximize2,
  Satellite,
  Sprout
} from "lucide-react";
import styles from "@/app/resultados/resultados.module.css";

type Mode = "overview" | "sanitation" | "recovery";
type BaseMap = "cartographic" | "satellite";

type RecoveryArea = {
  id: string;
  name: string;
  municipality: string;
  hectares: string;
};

const recoveryAreas: RecoveryArea[] = [
  { id: "nascentes-potengi", name: "Nascentes do Potengi", municipality: "Cerro Corá", hectares: "2,28 ha" },
  { id: "acude-eloy", name: "APP do Açude Eloy de Souza", municipality: "Cerro Corá", hectares: "3,11 ha" },
  { id: "mundo-novo", name: "Fazenda Mundo Novo", municipality: "São Tomé", hectares: "5,05 ha" },
  { id: "eaj", name: "Açude do Bêbado / EAJ", municipality: "Macaíba", hectares: "5,81 ha" }
];

const pinSvg = (fill: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <path d="M17 1.5C8.7 1.5 2 8.2 2 16.5c0 10.6 15 25.8 15 25.8s15-15.2 15-25.8C32 8.2 25.3 1.5 17 1.5Z"
        fill="${fill}" stroke="white" stroke-width="2.6"/>
      <circle cx="17" cy="16.2" r="5.1" fill="white"/>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const basinStyles = {
  overview: new Style({
    fill: new Fill({ color: "rgba(35,78,112,.025)" }),
    stroke: new Stroke({ color: "rgba(35,78,112,.94)", width: 2.15 })
  }),
  sanitation: new Style({
    fill: new Fill({ color: "rgba(35,78,112,.010)" }),
    stroke: new Stroke({ color: "rgba(35,78,112,.68)", width: 1.65 })
  }),
  recoveryOuter: new Style({
    fill: new Fill({ color: "rgba(35,78,112,.001)" }),
    stroke: new Stroke({ color: "rgba(255,255,255,.26)", width: 1.85 })
  }),
  recoveryInner: new Style({
    fill: new Fill({ color: "rgba(255,255,255,.001)" }),
    stroke: new Stroke({ color: "rgba(35,78,112,.62)", width: 1.15 })
  })
};

const riverStyles = {
  overviewMap: new Style({
    stroke: new Stroke({ color: "rgba(47,167,216,.68)", width: 1.05 })
  }),
  overviewSatellite: new Style({
    stroke: new Stroke({ color: "rgba(72,196,227,.46)", width: .95 })
  }),
  sanitationMap: new Style({
    stroke: new Stroke({ color: "rgba(47,167,216,.36)", width: .82 })
  }),
  sanitationSatellite: new Style({
    stroke: new Stroke({ color: "rgba(88,205,232,.23)", width: .72 })
  }),
  recoveryMap: new Style({
    stroke: new Stroke({ color: "rgba(47,167,216,.26)", width: .72 })
  }),
  recoverySatellite: new Style({
    stroke: new Stroke({ color: "rgba(116,223,247,.36)", width: .82 })
  })
};

const getRiverStyle = (mode: Mode, base: BaseMap) => {
  if (mode === "overview") {
    return base === "satellite" ? riverStyles.overviewSatellite : riverStyles.overviewMap;
  }
  if (mode === "sanitation") {
    return base === "satellite" ? riverStyles.sanitationSatellite : riverStyles.sanitationMap;
  }
  return base === "satellite" ? riverStyles.recoverySatellite : riverStyles.recoveryMap;
};

export default function ResultsTerritoryMap() {
  const mapTargetRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<OLMap | null>(null);
  const basinSourceRef = useRef<VectorSource | null>(null);
  const municipalitySourceRef = useRef<VectorSource | null>(null);
  const recoverySourceRef = useRef<VectorSource | null>(null);
  const markerSourceRef = useRef<VectorSource | null>(null);

  const basinLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const riverLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const municipalityLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const recoveryLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const markerLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const cartographicLayerRef = useRef<TileLayer<OSM> | null>(null);
  const satelliteLayerRef = useRef<TileLayer<XYZ> | null>(null);

  const modeRef = useRef<Mode>("overview");
  const baseMapRef = useRef<BaseMap>("cartographic");
  const selectedMunicipalityRef = useRef<string | null>(null);
  const selectedRecoveryRef = useRef<string | null>(null);

  const [mode, setMode] = useState<Mode>("overview");
  const [baseMap, setBaseMap] = useState<BaseMap>("cartographic");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedRecovery, setSelectedRecovery] = useState<string | null>(null);

  const fitExtent = (
    extent: number[],
    maxZoom = 10.5,
    padding: [number, number, number, number] = [54, 66, 56, 66]
  ) => {
    const map = mapRef.current;
    if (!map || !extent || isEmpty(extent)) return;
    map.getView().fit(extent, {
      padding,
      maxZoom,
      duration: 450
    });
  };

  const fitMunicipality = (extent: number[]) => {
    fitExtent(extent, 9.35, [76, 92, 76, 92]);
  };

  const fitMode = (nextMode: Mode) => {
    const basin = basinSourceRef.current;
    const municipalities = municipalitySourceRef.current;
    const recovery = recoverySourceRef.current;

    if (nextMode === "overview" && basin) {
      fitExtent(basin.getExtent(), 8.9);
      return;
    }

    if (nextMode === "sanitation" && municipalities) {
      const extent = createEmpty();
      municipalities.getFeatures().forEach((feature) => {
        if (feature.get("sanitation")) {
          const geometry = feature.getGeometry();
          if (geometry) extend(extent, geometry.getExtent());
        }
      });
      fitExtent(extent, 8.75);
      return;
    }

    if (nextMode === "recovery" && recovery) {
      fitExtent(recovery.getExtent(), 9.05);
    }
  };

  const refreshVectorStyles = () => {
    basinLayerRef.current?.changed();
    riverLayerRef.current?.changed();
    municipalityLayerRef.current?.changed();
    recoveryLayerRef.current?.changed();
    markerLayerRef.current?.changed();
  };

  const selectBaseMap = (nextBase: BaseMap) => {
    baseMapRef.current = nextBase;
    setBaseMap(nextBase);
  };

  const focusRecovery = (areaId: string) => {
    const source = recoverySourceRef.current;
    if (!source) return;

    const features = source.getFeatures().filter(
      (feature) => feature.get("area_id") === areaId
    );
    const extent = createEmpty();

    features.forEach((feature) => {
      const geometry = feature.getGeometry();
      if (geometry) extend(extent, geometry.getExtent());
    });

    setSelectedRecovery(areaId);
    selectedRecoveryRef.current = areaId;
    recoveryLayerRef.current?.changed();
    markerLayerRef.current?.changed();

    // A área de intervenção pode ser aproximada; a base escolhida pelo usuário é preservada.
    fitExtent(extent, 15.2, [72, 92, 72, 92]);
  };

  const selectMode = (nextMode: Mode) => {
    modeRef.current = nextMode;
    setMode(nextMode);

    setSelectedMunicipality(null);
    setSelectedRecovery(null);
    selectedMunicipalityRef.current = null;
    selectedRecoveryRef.current = null;

    // Comportamento inteligente aprovado:
    // Visão geral/Saneamento -> mapa; Recuperação -> satélite.
    const defaultBase: BaseMap = nextMode === "recovery" ? "satellite" : "cartographic";
    baseMapRef.current = defaultBase;
    setBaseMap(defaultBase);

    refreshVectorStyles();
    fitMode(nextMode);
  };

  useEffect(() => {
    if (!mapTargetRef.current) return;

    const format = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857"
    });

    const basinSource = new VectorSource({
      url: "/data/geospatial/limite-bacia.geojson",
      format
    });
    const riversSource = new VectorSource({
      url: "/data/geospatial/rios.geojson",
      format
    });
    const municipalitySource = new VectorSource({
      url: "/data/geospatial/municipios-potengi-resultados.geojson",
      format
    });
    const recoverySource = new VectorSource({
      url: "/data/geospatial/areas-recuperacao-resultados.geojson",
      format
    });
    const markerSource = new VectorSource();

    basinSourceRef.current = basinSource;
    municipalitySourceRef.current = municipalitySource;
    recoverySourceRef.current = recoverySource;
    markerSourceRef.current = markerSource;

    const cartographicLayer = new TileLayer({
      source: new OSM(),
      opacity: .60
    });

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous"
      }),
      visible: false
    });

    cartographicLayerRef.current = cartographicLayer;
    satelliteLayerRef.current = satelliteLayer;

    const municipalityLayer = new VectorLayer({
      source: municipalitySource,
      zIndex: 2,
      declutter: true,
      style: (feature, resolution) => {
        const currentMode = modeRef.current;
        const currentBase = baseMapRef.current;
        const sanitation = Boolean(feature.get("sanitation"));
        const recovery = Boolean(feature.get("recovery"));
        const selected = feature.get("name") === selectedMunicipalityRef.current;

        let fill = "rgba(255,255,255,.025)";
        let stroke = "rgba(36,74,80,.18)";
        let strokeWidth = .55;

        if (currentMode === "overview") {
          fill = recovery ? "rgba(100,116,139,.055)" : "rgba(255,255,255,.018)";
          stroke = recovery ? "rgba(100,116,139,.64)" : "rgba(67,86,101,.24)";
          strokeWidth = recovery ? 1.05 : .62;
        }

        if (currentMode === "sanitation") {
          const satellite = currentBase === "satellite";
          fill = sanitation
            ? (satellite ? "rgba(124,106,230,.12)" : "rgba(124,106,230,.15)")
            : "rgba(255,255,255,.006)";
          stroke = sanitation
            ? (satellite ? "rgba(151,134,245,.86)" : "rgba(108,88,214,.78)")
            : "rgba(70,87,89,.08)";
          strokeWidth = sanitation ? 1.25 : .38;
        }

        if (currentMode === "recovery") {
          // Município é contexto territorial visível, mas ainda secundário à área de intervenção.
          fill = recovery ? "rgba(100,116,139,.055)" : "rgba(255,255,255,.002)";
          stroke = recovery ? "rgba(148,163,184,.72)" : "rgba(65,84,87,.045)";
          strokeWidth = recovery ? 1.05 : .28;
        }

        // Município selecionado mantém a linguagem violeta do modo Saneamento.
        if (selected && currentMode !== "recovery") {
          fill = currentBase === "satellite"
            ? "rgba(124,106,230,.18)"
            : "rgba(124,106,230,.20)";
          stroke = "#6655D6";
          strokeWidth = 2.35;
        }

        const shouldLabel =
          selected ||
          (
            currentMode === "sanitation" &&
            sanitation &&
            resolution < 1250
          ) ||
          (
            currentMode === "recovery" &&
            recovery &&
            resolution < 1150
          );

        const label = shouldLabel
          ? new Text({
              text: String(feature.get("name") ?? ""),
              font: selected
                ? "800 12.5px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                : "700 11.5px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fill: new Fill({ color: "#173d43" }),
              stroke: new Stroke({ color: "rgba(255,255,255,.96)", width: 4 })
            })
          : undefined;

        return new Style({
          fill: new Fill({ color: fill }),
          stroke: new Stroke({ color: stroke, width: strokeWidth }),
          text: label
        });
      }
    });

    const basinLayer = new VectorLayer({
      source: basinSource,
      zIndex: 3,
      style: () => modeRef.current === "recovery" ? [basinStyles.recoveryOuter, basinStyles.recoveryInner] : basinStyles[modeRef.current]
    });

    const riverLayer = new VectorLayer({
      source: riversSource,
      zIndex: 4,
      style: () => getRiverStyle(modeRef.current, baseMapRef.current)
    });

    const recoveryLayer = new VectorLayer({
      source: recoverySource,
      zIndex: 6,
      visible: false,
      style: (feature) => {
        const selected = feature.get("area_id") === selectedRecoveryRef.current;

        const intervention = new Style({
          fill: new Fill({
            color: selected ? "rgba(217,119,6,.16)" : "rgba(245,158,11,.10)"
          }),
          stroke: new Stroke({
            color: selected ? "#D97706" : "#F59E0B",
            width: selected ? 3.4 : 2.45
          })
        });

        if (!selected) return intervention;

        const halo = new Style({
          fill: new Fill({ color: "rgba(255,255,255,.01)" }),
          stroke: new Stroke({ color: "rgba(255,255,255,.92)", width: 5.8 })
        });

        return [halo, intervention];
      }
    });

    const markerLayer = new VectorLayer({
      source: markerSource,
      zIndex: 8,
      declutter: true,
      visible: false,
      style: (feature) => {
        const selected = feature.get("area_id") === selectedRecoveryRef.current;
        const hectares = Number(feature.get("hectares")).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

        return new Style({
          image: new Icon({
            src: pinSvg(selected ? "#D97706" : "#F59E0B"),
            anchor: [.5, 1],
            scale: selected ? .92 : .78
          }),
          text: selected
            ? new Text({
                text: `${feature.get("name")} · ${hectares} ha`,
                offsetY: -43,
                font: "800 12px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fill: new Fill({ color: "#173d43" }),
                stroke: new Stroke({ color: "rgba(255,255,255,.98)", width: 4 })
              })
            : undefined
        });
      }
    });

    basinLayerRef.current = basinLayer;
    riverLayerRef.current = riverLayer;
    municipalityLayerRef.current = municipalityLayer;
    recoveryLayerRef.current = recoveryLayer;
    markerLayerRef.current = markerLayer;

    const map = new OLMap({
      target: mapTargetRef.current,
      controls: [],
      layers: [
        cartographicLayer,
        satelliteLayer,
        municipalityLayer,
        basinLayer,
        riverLayer,
        recoveryLayer,
        markerLayer
      ],
      view: new View({
        center: fromLonLat([-35.88, -5.98]),
        zoom: 8,
        minZoom: 6.8,
        maxZoom: 18
      })
    });

    mapRef.current = map;

    basinSource.once("featuresloadend", () => fitMode(modeRef.current));

    recoverySource.once("featuresloadend", () => {
      markerSource.clear();

      recoverySource.getFeatures().forEach((feature) => {
        const geometry = feature.getGeometry();
        if (!geometry) return;

        markerSource.addFeature(
          new Feature({
            geometry: new Point(getCenter(geometry.getExtent())),
            kind: "recovery-marker",
            area_id: feature.get("area_id"),
            name: feature.get("name"),
            municipality: feature.get("municipality"),
            hectares: feature.get("hectares")
          })
        );
      });

      if (modeRef.current === "recovery") fitMode("recovery");
    });

    map.on("pointermove", (event) => {
      const currentMode = modeRef.current;

      const hit = Boolean(
        map.forEachFeatureAtPixel(
          event.pixel,
          (feature, layer) => {
            if (currentMode === "recovery") {
              return layer === recoveryLayer || layer === markerLayer;
            }

            if (layer === municipalityLayer) {
              if (currentMode === "sanitation") return Boolean(feature.get("sanitation"));
              return true;
            }

            return false;
          },
          {
            layerFilter: (layer) =>
              layer === municipalityLayer ||
              layer === recoveryLayer ||
              layer === markerLayer
          }
        )
      );

      map.getTargetElement().style.cursor = hit ? "pointer" : "";
    });

    map.on("singleclick", (event) => {
      let handled = false;

      map.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) => {
          if (handled) return;

          const currentMode = modeRef.current;
          const kind = feature.get("kind");

          if (
            currentMode === "recovery" &&
            (kind === "recovery-area" || kind === "recovery-marker")
          ) {
            focusRecovery(String(feature.get("area_id")));
            handled = true;
            return;
          }

          if (layer === municipalityLayer && currentMode !== "recovery") {
            if (currentMode === "sanitation" && !feature.get("sanitation")) return;

            const name = String(feature.get("name"));
            selectedMunicipalityRef.current = name;
            setSelectedMunicipality(name);
            municipalityLayer.changed();

            const geometry = feature.getGeometry();
            if (geometry) fitMunicipality(geometry.getExtent());

            handled = true;
          }
        },
        {
          layerFilter: (layer) =>
            layer === municipalityLayer ||
            layer === recoveryLayer ||
            layer === markerLayer
        }
      );
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    modeRef.current = mode;

    const recoveryVisible = mode === "recovery";
    recoveryLayerRef.current?.setVisible(recoveryVisible);
    markerLayerRef.current?.setVisible(recoveryVisible);

    refreshVectorStyles();
  }, [mode]);

  useEffect(() => {
    selectedMunicipalityRef.current = selectedMunicipality;
    municipalityLayerRef.current?.changed();
  }, [selectedMunicipality]);

  useEffect(() => {
    selectedRecoveryRef.current = selectedRecovery;
    recoveryLayerRef.current?.changed();
    markerLayerRef.current?.changed();
  }, [selectedRecovery]);

  useEffect(() => {
    baseMapRef.current = baseMap;
    cartographicLayerRef.current?.setVisible(baseMap === "cartographic");
    satelliteLayerRef.current?.setVisible(baseMap === "satellite");
    refreshVectorStyles();
  }, [baseMap]);

  const selectedRecoveryData = recoveryAreas.find((area) => area.id === selectedRecovery);

  return (
    <div className={styles.territoryShell}>
      <div className={styles.mapToolbar}>
        <div className={styles.modeTabs} role="tablist" aria-label="Visões do mapa de resultados">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "overview"}
            className={mode === "overview" ? styles.modeTabActive : undefined}
            onClick={() => selectMode("overview")}
          >
            <MapPinned size={16} aria-hidden="true" />
            Visão geral
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "sanitation"}
            className={mode === "sanitation" ? styles.modeTabActive : undefined}
            onClick={() => selectMode("sanitation")}
          >
            <Droplets size={16} aria-hidden="true" />
            Saneamento
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "recovery"}
            className={mode === "recovery" ? styles.modeTabActive : undefined}
            onClick={() => selectMode("recovery")}
          >
            <Sprout size={16} aria-hidden="true" />
            Recuperação ambiental
          </button>
        </div>

        <div className={styles.mapBaseSwitch} aria-label="Mapa de base">
          <button
            type="button"
            aria-pressed={baseMap === "cartographic"}
            className={baseMap === "cartographic" ? styles.baseActive : undefined}
            onClick={() => selectBaseMap("cartographic")}
            title="Base cartográfica"
          >
            <MapIcon size={15} aria-hidden="true" />
            <span>Mapa</span>
          </button>

          <button
            type="button"
            aria-pressed={baseMap === "satellite"}
            className={baseMap === "satellite" ? styles.baseActive : undefined}
            onClick={() => selectBaseMap("satellite")}
            title="Imagem de satélite"
          >
            <Satellite size={15} aria-hidden="true" />
            <span>Satélite</span>
          </button>
        </div>
      </div>

      <div className={styles.territoryBody}>
        <div className={styles.mapStage}>
          <div
            ref={mapTargetRef}
            className={styles.mapCanvas}
            aria-label="Mapa interativo dos resultados territoriais do Projeto Potengi"
          />

          <button
            type="button"
            className={styles.reframeButton}
            onClick={() => fitMode(mode)}
            title="Reenquadrar a visão atual"
          >
            <Maximize2 size={16} aria-hidden="true" />
            <span>Reenquadrar</span>
          </button>

          <div className={styles.dynamicLegend}>
            <span><i className={styles.legendBasin} /> Limite da bacia</span>

            {mode !== "recovery" && (
              <span><i className={styles.legendRiver} /> Rede hidrográfica</span>
            )}

            {mode === "sanitation" && (
              <span><i className={styles.legendSanitation} /> Municípios da Meta 6</span>
            )}

            {mode === "recovery" && (
              <>
                <span><i className={styles.legendRecoveryMunicipality} /> Município com recuperação</span>
                <span><i className={styles.legendRecoveryArea} /> Áreas de intervenção</span>
                <span className={styles.legendSecondary}><i className={styles.legendRiver} /> Rede hidrográfica</span>
              </>
            )}
          </div>

          <small className={styles.mapAttribution}>
            {baseMap === "satellite" ? "Imagem: Esri World Imagery" : "Base: OpenStreetMap"}
          </small>
        </div>

        <aside className={styles.territoryPanel} aria-live="polite">
          {mode === "overview" && (
            <>
              <p className={styles.panelEyebrow}>VISÃO GERAL</p>
              <h3>A bacia como referência comum</h3>
              <p className={styles.panelLead}>
                A leitura geral reúne o limite da bacia, sua rede hidrográfica e
                o recorte municipal disponível no acervo geoespacial do projeto.
              </p>

              <dl className={styles.overviewStats}>
                <div><dt>25</dt><dd>municípios abrangidos pela Meta 6</dd></div>
                <div><dt>3</dt><dd>municípios com áreas de recuperação</dd></div>
                <div><dt>4</dt><dd>áreas de intervenção associadas à recuperação</dd></div>
                <div><dt>16,25 ha</dt><dd>resultado consolidado</dd></div>
              </dl>

              {selectedMunicipality && (
                <div className={styles.selectionNote}>
                  <span>Município selecionado</span>
                  <strong>{selectedMunicipality}</strong>
                </div>
              )}

              <p className={styles.panelHint}>
                Clique em um município para aproximar a leitura. O enquadramento
                preserva o território municipal completo e seu entorno.
              </p>
            </>
          )}

          {mode === "sanitation" && (
            <>
              <p className={styles.panelEyebrow}>META 6 · SANEAMENTO</p>
              <h3>25 municípios abrangidos</h3>
              <p className={styles.panelLead}>
                O diagnóstico e as proposições contemplam abastecimento de água,
                esgotamento sanitário, resíduos sólidos e drenagem urbana.
              </p>

              <div className={styles.sanitationAxes}>
                <span>Abastecimento de água</span>
                <span>Esgotamento sanitário</span>
                <span>Resíduos sólidos</span>
                <span>Drenagem urbana</span>
              </div>

              {selectedMunicipality ? (
                <div className={styles.selectionNoteStrong}>
                  <span>Município selecionado</span>
                  <strong>{selectedMunicipality}</strong>
                  <small>Integrante do conjunto de 25 municípios da Meta 6.</small>
                </div>
              ) : (
                <div className={styles.mapInstruction}>
                  <strong>Explore os municípios no mapa</strong>
                  <span>
                    Clique em um polígono para identificá-lo e aproximar a leitura
                    sem perder o limite municipal.
                  </span>
                </div>
              )}
            </>
          )}

          {mode === "recovery" && (
            <>
              <p className={styles.panelEyebrow}>RECUPERAÇÃO AMBIENTAL</p>

              <div className={styles.recoveryTotal}>
                <strong>16,25 ha</strong>
                <span>resultado consolidado em quatro áreas</span>
              </div>

              <div className={styles.recoveryList}>
                {recoveryAreas.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    className={selectedRecovery === area.id ? styles.recoveryItemActive : undefined}
                    onClick={() => focusRecovery(area.id)}
                  >
                    <span>
                      <b>{area.name}</b>
                      <small>{area.municipality}</small>
                    </span>
                    <strong>{area.hectares}</strong>
                  </button>
                ))}
              </div>

              {selectedRecoveryData ? (
                <div className={styles.recoveryDetail}>
                  <div>
                    <span>Município</span>
                    <strong>{selectedRecoveryData.municipality}</strong>
                  </div>
                  <div>
                    <span>Área de intervenção</span>
                    <strong>{selectedRecoveryData.name}</strong>
                  </div>
                  <div>
                    <span>Hectares consolidados</span>
                    <strong>{selectedRecoveryData.hectares}</strong>
                  </div>
                </div>
              ) : (
                <div className={styles.mapInstruction}>
                  <strong>Selecione uma área de intervenção</strong>
                  <span>
                    O mapa aproxima a geometria real disponível no acervo e mantém
                    município, bacia e demais referências como contexto.
                  </span>
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      <div className={styles.mapSourceLine}>
        <Layers3 size={14} aria-hidden="true" />
        <span>
          Fontes cartográficas: Projeto Potengi — limite da bacia, rede hidrográfica
          e áreas de intervenção; camada municipal do acervo; bases OpenStreetMap e
          Esri World Imagery.
        </span>
      </div>
    </div>
  );
}
