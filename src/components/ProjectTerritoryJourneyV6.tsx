"use client";

import { useEffect, useRef, useState } from "react";
import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import Point from "ol/geom/Point";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat, transformExtent } from "ol/proj";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import {
  createEmpty,
  extend as extendExtent,
  getCenter,
  isEmpty as isEmptyExtent
} from "ol/extent";
import { ChevronRight, MapPinned } from "lucide-react";
import styles from "@/app/projeto/projeto-multiescala.module.css";

type StageId = "brasil" | "nordeste" | "rn" | "municipios" | "bacia";

type Stage = {
  id: StageId;
  number: string;
  label: string;
  title: string;
  text: string;
  next?: string;
};

const stages: Stage[] = [
  {
    id: "brasil",
    number: "01",
    label: "Brasil",
    title: "A bacia no Nordeste brasileiro",
    text:
      "A escala nacional situa o projeto no país, mantendo a Bacia do Rio Potengi como referência territorial.",
    next: "Aproximar para o Nordeste"
  },
  {
    id: "nordeste",
    number: "02",
    label: "Nordeste",
    title: "Do Nordeste ao Rio Grande do Norte",
    text:
      "Os nove estados nordestinos formam o contexto regional. A referência da bacia permanece marcada no Rio Grande do Norte.",
    next: "Aproximar para o RN"
  },
  {
    id: "rn",
    number: "03",
    label: "Rio Grande do Norte",
    title: "A bacia no território potiguar",
    text:
      "Na escala estadual, a geometria da Bacia do Rio Potengi aparece destacada dentro do contorno do Rio Grande do Norte.",
    next: "Ver os municípios"
  },
  {
    id: "municipios",
    number: "04",
    label: "Municípios da bacia",
    title: "Uma bacia que ultrapassa limites municipais",
    text:
      "Os limites administrativos evidenciam o caráter intermunicipal do território. A bacia permanece como unidade principal de leitura.",
    next: "Entrar na bacia"
  },
  {
    id: "bacia",
    number: "05",
    label: "Bacia do Potengi",
    title: "A unidade territorial do projeto",
    text:
      "A aproximação final chega à bacia em imagem de satélite, com seu limite e sua rede hidrográfica."
  }
];

const NORTHEAST_STATES = [
  "al", "ba", "ce", "ma", "pb", "pe", "pi", "rn", "se"
];

const locationPinSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
    <path d="M20 1.5C10.1 1.5 2 9.6 2 19.5c0 13.4 18 30.5 18 30.5s18-17.1 18-30.5C38 9.6 29.9 1.5 20 1.5Z"
      fill="#D6AA22" stroke="white" stroke-width="3.2"/>
    <circle cx="20" cy="19.5" r="6.2" fill="white"/>
  </svg>
`);

const basinPinStyle = new Style({
  image: new Icon({
    src: `data:image/svg+xml;charset=UTF-8,${locationPinSvg}`,
    anchor: [0.5, 1],
    scale: 0.72
  }),
  text: new Text({
    text: "Bacia do Potengi",
    offsetY: -47,
    font: "700 12px system-ui, sans-serif",
    fill: new Fill({ color: "#173e45" }),
    stroke: new Stroke({ color: "rgba(255,255,255,.96)", width: 4 })
  })
});

const northeastStateStyle = new Style({
  fill: new Fill({ color: "rgba(30,111,82,.055)" }),
  stroke: new Stroke({ color: "rgba(55,87,99,.48)", width: 1.05 })
});

const northeastRnStyle = new Style({
  fill: new Fill({ color: "rgba(214,170,34,.18)" }),
  stroke: new Stroke({ color: "#c79313", width: 1.9 })
});

const rnStateStyle = new Style({
  fill: new Fill({ color: "rgba(72,92,105,.035)" }),
  stroke: new Stroke({ color: "rgba(54,82,94,.78)", width: 1.65 })
});

const basinBroadStyle = new Style({
  fill: new Fill({ color: "rgba(214,170,34,.24)" }),
  stroke: new Stroke({ color: "#c79313", width: 2.25 })
});

const basinMunicipalityStyle = new Style({
  fill: new Fill({ color: "rgba(214,170,34,.075)" }),
  stroke: new Stroke({ color: "#c79313", width: 2.45 })
});

const basinFinalStyle = new Style({
  fill: new Fill({ color: "rgba(24,112,81,.035)" }),
  stroke: new Stroke({ color: "rgba(31,111,79,.94)", width: 2.1 })
});

const municipalityContextStyle = new Style({
  fill: new Fill({ color: "rgba(255,255,255,0)" }),
  stroke: new Stroke({ color: "rgba(69,91,98,.18)", width: 0.65 })
});

const municipalityBasinStyle = new Style({
  fill: new Fill({ color: "rgba(44,132,91,.13)" }),
  stroke: new Stroke({ color: "rgba(34,104,78,.75)", width: 1.15 })
});

const riverStyle = new Style({
  stroke: new Stroke({ color: "rgba(81,196,226,.70)", width: 0.88 })
});

const brazilBounds: [number, number, number, number] =
  [-73.0, -34.0, -34.2, 5.5];

function collectCoordinates(node: unknown, output: number[][]) {
  if (!Array.isArray(node)) return;

  if (
    node.length >= 2 &&
    typeof node[0] === "number" &&
    typeof node[1] === "number"
  ) {
    output.push([node[0], node[1]]);
    return;
  }

  node.forEach((child) => collectCoordinates(child, output));
}

function sampledCoordinates(feature: Feature, maxSamples = 150) {
  const geometry = feature.getGeometry();
  const coords: number[][] = [];
  const getCoordinates = (geometry as unknown as { getCoordinates?: () => unknown })
    ?.getCoordinates;

  if (typeof getCoordinates === "function") {
    collectCoordinates(getCoordinates.call(geometry), coords);
  }

  if (coords.length <= maxSamples) return coords;

  const step = Math.max(1, Math.floor(coords.length / maxSamples));
  return coords.filter((_, index) => index % step === 0);
}

function municipalitiesIntersectingBasin(
  municipalitySource: VectorSource,
  basinSource: VectorSource
) {
  const basinFeatures = basinSource.getFeatures();
  if (!basinFeatures.length) return [];

  const basinExtent = basinSource.getExtent();
  if (!basinExtent) return [];
  const basinSamples = basinFeatures.flatMap((feature) =>
    sampledCoordinates(feature, 180)
  );

  const selected: Feature[] = [];

  municipalitySource.getFeatures().forEach((municipality) => {
    const municipalityGeometry = municipality.getGeometry();

    if (!municipalityGeometry?.intersectsExtent(basinExtent)) {
      municipality.set("inBasin", false);
      return;
    }

    const municipalitySamples = sampledCoordinates(municipality, 90);

    const basinVertexInsideMunicipality = basinSamples.some((coordinate) =>
      municipalityGeometry.intersectsCoordinate(coordinate)
    );

    const municipalityVertexInsideBasin = municipalitySamples.some((coordinate) =>
      basinFeatures.some((basin) =>
        basin.getGeometry()?.intersectsCoordinate(coordinate)
      )
    );

    const intersects =
      basinVertexInsideMunicipality || municipalityVertexInsideBasin;

    municipality.set("inBasin", intersects);
    if (intersects) selected.push(municipality);
  });

  return selected;
}

export default function ProjectTerritoryJourneyV6() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const basinSourceRef = useRef<VectorSource | null>(null);
  const rnSourceRef = useRef<VectorSource | null>(null);
  const northeastSourceRef = useRef<VectorSource | null>(null);
  const municipalitySourceRef = useRef<VectorSource | null>(null);
  const basinPointSourceRef = useRef<VectorSource | null>(null);

  const lightBaseRef = useRef<TileLayer<XYZ> | null>(null);
  const lightLabelsRef = useRef<TileLayer<XYZ> | null>(null);
  const satelliteRef = useRef<TileLayer<XYZ> | null>(null);

  const northeastLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const rnLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const municipalityLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const basinLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const riversLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const basinPointLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const selectedMunicipalitiesRef = useRef<Feature[]>([]);
  const stageRef = useRef<StageId>("brasil");
  const [stage, setStage] = useState<StageId>("brasil");

  const activeIndex = stages.findIndex((item) => item.id === stage);
  const activeStage = stages[activeIndex];

  const classifyMunicipalities = () => {
    const municipalitySource = municipalitySourceRef.current;
    const basinSource = basinSourceRef.current;
    if (!municipalitySource || !basinSource) return;

    if (
      !municipalitySource.getFeatures().length ||
      !basinSource.getFeatures().length
    ) {
      return;
    }

    selectedMunicipalitiesRef.current = municipalitiesIntersectingBasin(
      municipalitySource,
      basinSource
    );

    municipalityLayerRef.current?.changed();
  };

  const updateLayerState = (nextStage: StageId) => {
    const isNortheast = nextStage === "nordeste";
    const isRn = nextStage === "rn";
    const isMunicipios = nextStage === "municipios";
    const isBasin = nextStage === "bacia";

    lightBaseRef.current?.setVisible(!isBasin);
    lightLabelsRef.current?.setVisible(!isBasin);
    satelliteRef.current?.setVisible(isBasin);

    northeastLayerRef.current?.setVisible(isNortheast);
    rnLayerRef.current?.setVisible(isRn || isMunicipios);
    municipalityLayerRef.current?.setVisible(isMunicipios);

    // A bacia é o objeto constante da narrativa.
    basinLayerRef.current?.setVisible(true);
    basinLayerRef.current?.setStyle(
      isBasin
        ? basinFinalStyle
        : isMunicipios
          ? basinMunicipalityStyle
          : basinBroadStyle
    );

    // Marcador nas escalas abertas; na leitura municipal e final,
    // a geometria passa a comunicar melhor o território.
    basinPointLayerRef.current?.setVisible(!isMunicipios && !isBasin);
    riversLayerRef.current?.setVisible(isBasin);
  };

  const moveToStage = (nextStage: StageId, animate = true) => {
    const map = mapRef.current;
    if (!map) return;

    stageRef.current = nextStage;
    setStage(nextStage);
    updateLayerState(nextStage);

    const view = map.getView();
    const duration = animate ? 850 : 0;

    if (nextStage === "bacia") {
      const source = basinSourceRef.current;
      if (!source || source.getFeatures().length === 0) return;
      const extent = source.getExtent();
      if (!extent) return;

      view.fit(extent, {
        padding: [52, 60, 52, 60],
        maxZoom: 9.5,
        duration
      });
      return;
    }

    if (nextStage === "municipios") {
      classifyMunicipalities();

      const selected = selectedMunicipalitiesRef.current;
      if (selected.length) {
        const extent = createEmpty();
        selected.forEach((feature) => {
          const geometry = feature.getGeometry();
          if (geometry) extendExtent(extent, geometry.getExtent());
        });

        if (!isEmptyExtent(extent)) {
          view.fit(extent, {
            padding: [48, 62, 48, 62],
            maxZoom: 8.25,
            duration
          });
          return;
        }
      }

      const basinSource = basinSourceRef.current;
      if (basinSource?.getFeatures().length) {
        const extent = basinSource.getExtent();
        if (!extent) return;
        view.fit(extent, {
          padding: [54, 68, 54, 68],
          maxZoom: 8.1,
          duration
        });
      }
      return;
    }

    if (nextStage === "rn") {
      const source = rnSourceRef.current;
      if (source && source.getFeatures().length > 0) {
        const extent = source.getExtent();
        if (!extent) return;
        view.fit(extent, {
          padding: [44, 54, 44, 54],
          maxZoom: 7.65,
          duration
        });
        return;
      }

      view.fit(
        transformExtent(
          [-38.8, -7.25, -34.7, -4.6],
          "EPSG:4326",
          "EPSG:3857"
        ),
        { padding: [44, 54, 44, 54], duration }
      );
      return;
    }

    if (nextStage === "nordeste") {
      const source = northeastSourceRef.current;
      if (source && source.getFeatures().length > 0) {
        const extent = source.getExtent();
        if (!extent) return;
        view.fit(extent, {
          padding: [38, 48, 38, 48],
          maxZoom: 5.35,
          duration
        });
        return;
      }

      view.fit(
        transformExtent(
          [-48.9, -18.7, -34.5, -1.0],
          "EPSG:4326",
          "EPSG:3857"
        ),
        { padding: [38, 48, 38, 48], duration }
      );
      return;
    }

    view.fit(
      transformExtent(brazilBounds, "EPSG:4326", "EPSG:3857"),
      {
        padding: [34, 46, 34, 46],
        maxZoom: 4.25,
        duration
      }
    );
  };

  const nextStage = () => {
    if (activeIndex >= stages.length - 1) {
      moveToStage("brasil");
      return;
    }
    moveToStage(stages[activeIndex + 1].id);
  };

  useEffect(() => {
    if (!targetRef.current) return;

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

    const rnSource = new VectorSource({
      url:
        "https://raw.githubusercontent.com/giuliano-macedo/geodata-br-states/main/geojson/br_states/br_rn.json",
      format
    });

    const municipalitySource = new VectorSource({
      url:
        "https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-24-mun.json",
      format
    });

    const northeastSource = new VectorSource();
    const basinPointSource = new VectorSource();

    basinSourceRef.current = basinSource;
    rnSourceRef.current = rnSource;
    northeastSourceRef.current = northeastSource;
    municipalitySourceRef.current = municipalitySource;
    basinPointSourceRef.current = basinPointSource;

    const lightBase = new TileLayer({
      source: new XYZ({
        url:
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous"
      })
    });

    const lightLabels = new TileLayer({
      source: new XYZ({
        url:
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous"
      }),
      zIndex: 9
    });

    const satellite = new TileLayer({
      source: new XYZ({
        url:
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous"
      }),
      visible: false
    });

    const northeastLayer = new VectorLayer({
      source: northeastSource,
      style: (feature) =>
        feature.get("uf") === "RN"
          ? northeastRnStyle
          : northeastStateStyle,
      visible: false,
      zIndex: 3
    });

    const rnLayer = new VectorLayer({
      source: rnSource,
      style: rnStateStyle,
      visible: false,
      zIndex: 4
    });

    const municipalityLayer = new VectorLayer({
      source: municipalitySource,
      style: (feature) =>
        feature.get("inBasin")
          ? municipalityBasinStyle
          : municipalityContextStyle,
      visible: false,
      zIndex: 5
    });

    const basinLayer = new VectorLayer({
      source: basinSource,
      style: basinBroadStyle,
      visible: true,
      zIndex: 6
    });

    const riversLayer = new VectorLayer({
      source: riversSource,
      style: riverStyle,
      visible: false,
      zIndex: 7
    });

    const basinPointLayer = new VectorLayer({
      source: basinPointSource,
      style: basinPinStyle,
      visible: true,
      zIndex: 12
    });

    lightBaseRef.current = lightBase;
    lightLabelsRef.current = lightLabels;
    satelliteRef.current = satellite;
    northeastLayerRef.current = northeastLayer;
    rnLayerRef.current = rnLayer;
    municipalityLayerRef.current = municipalityLayer;
    basinLayerRef.current = basinLayer;
    riversLayerRef.current = riversLayer;
    basinPointLayerRef.current = basinPointLayer;

    const map = new Map({
      target: targetRef.current,
      controls: [],
      layers: [
        lightBase,
        satellite,
        northeastLayer,
        rnLayer,
        municipalityLayer,
        basinLayer,
        riversLayer,
        lightLabels,
        basinPointLayer
      ],
      view: new View({
        center: fromLonLat([-48, -14]),
        zoom: 3.5,
        minZoom: 3,
        maxZoom: 16
      })
    });

    mapRef.current = map;
    moveToStage("brasil", false);

    Promise.all(
      NORTHEAST_STATES.map(async (uf) => {
        const response = await fetch(
          `https://raw.githubusercontent.com/giuliano-macedo/geodata-br-states/main/geojson/br_states/br_${uf}.json`
        );
        if (!response.ok) {
          throw new Error(`Falha ao carregar ${uf.toUpperCase()}`);
        }

        const data = await response.json();
        const features = format.readFeatures(data);
        features.forEach((feature) =>
          feature.set("uf", uf.toUpperCase())
        );
        return features;
      })
    )
      .then((groups) => {
        northeastSource.addFeatures(groups.flat());
        if (stageRef.current === "nordeste") {
          moveToStage("nordeste", false);
        }
      })
      .catch(() => {
        // O enquadramento regional continua disponível pela base cartográfica.
      });

    municipalitySource.on("featuresloadend", () => {
      classifyMunicipalities();
      if (stageRef.current === "municipios") {
        moveToStage("municipios", false);
      }
    });

    rnSource.once("featuresloadend", () => {
      if (stageRef.current === "rn") moveToStage("rn", false);
    });

    basinSource.once("featuresloadend", () => {
      const extent = basinSource.getExtent();
      if (!extent) return;
      const basinCenter = getCenter(extent);
      basinPointSource.clear();
      basinPointSource.addFeature(
        new Feature({ geometry: new Point(basinCenter) })
      );

      classifyMunicipalities();
      updateLayerState(stageRef.current);

      if (
        stageRef.current === "municipios" ||
        stageRef.current === "bacia"
      ) {
        moveToStage(stageRef.current, false);
      }
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  return (
    <div className={styles.territoryJourney}>
      <aside className={styles.journeyPanel}>
        <div className={styles.journeyProgress} aria-label="Escalas territoriais">
          {stages.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                stage === item.id
                  ? styles.journeyStepActive
                  : undefined
              }
              aria-pressed={stage === item.id}
              onClick={() => moveToStage(item.id)}
            >
              <b>{item.number}</b>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.journeyNarrative} aria-live="polite">
          <span>
            {activeStage.number} · {activeStage.label.toUpperCase()}
          </span>
          <h3>{activeStage.title}</h3>
          <p>{activeStage.text}</p>
        </div>

        <button
          type="button"
          className={styles.journeyNext}
          onClick={nextStage}
        >
          <span>{activeStage.next ?? "Voltar ao Brasil"}</span>
          <ChevronRight size={17} aria-hidden="true" />
        </button>

        <div className={styles.journeyNote}>
          <MapPinned size={15} aria-hidden="true" />
          <span>
            {stage === "bacia"
              ? "Imagem de satélite com limite da bacia e rede hidrográfica do acervo do projeto."
              : stage === "municipios"
                ? "Os limites municipais são referência administrativa; a bacia permanece como unidade territorial principal."
                : "O marcador mantém a Bacia do Potengi como referência durante toda a aproximação."}
          </span>
        </div>
      </aside>

      <div className={styles.journeyMap}>
        <div
          ref={targetRef}
          className={styles.journeyMapCanvas}
          style={{ minHeight: "590px", width: "100%" }}
          aria-label={`Mapa de localização — ${activeStage.label}`}
        />

        <div className={styles.mapStageBadge}>
          <b>{activeStage.number}</b>
          <span>{activeStage.label}</span>
        </div>

        <small className={styles.mapCredit}>
          {stage === "bacia"
            ? "Imagem: Esri World Imagery"
            : stage === "municipios"
              ? "Municípios: IBGE via geodata-br · Bacia: Projeto Potengi"
              : "Base: Esri Light Gray Canvas"}
        </small>
      </div>
    </div>
  );
}
