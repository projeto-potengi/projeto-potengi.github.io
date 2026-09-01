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
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style
} from "ol/style";
import { getCenter } from "ol/extent";
import { ChevronRight, MapPinned } from "lucide-react";
import styles from "@/app/projeto/projeto.module.css";

type StageId = "brasil" | "nordeste" | "rn" | "bacia";

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
    title: "No Nordeste brasileiro",
    text: "A aproximação começa no Brasil e posiciona o Rio Grande do Norte no extremo oriental do Nordeste.",
    next: "Aproximar para o Nordeste"
  },
  {
    id: "nordeste",
    number: "02",
    label: "Nordeste",
    title: "Rio Grande do Norte em destaque",
    text: "A escala regional evidencia o estado no conjunto nordestino antes de aproximar a unidade territorial do projeto.",
    next: "Aproximar para o RN"
  },
  {
    id: "rn",
    number: "03",
    label: "Rio Grande do Norte",
    title: "A bacia no território potiguar",
    text: "O contorno correto do estado contextualiza a posição da Bacia Hidrográfica do Rio Potengi.",
    next: "Entrar na bacia"
  },
  {
    id: "bacia",
    number: "04",
    label: "Bacia do Potengi",
    title: "A unidade territorial do projeto",
    text: "A imagem de satélite aproxima a leitura até a bacia, com seu limite e sua rede hidrográfica."
  }
];

const locatorStyle = new Style({
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({ color: "#d6aa22" }),
    stroke: new Stroke({ color: "rgba(255,255,255,.98)", width: 4 })
  })
});

const rnNordesteStyle = new Style({
  fill: new Fill({ color: "rgba(214,170,34,.20)" }),
  stroke: new Stroke({ color: "#c79313", width: 2.2 })
});

const rnStateStyle = new Style({
  fill: new Fill({ color: "rgba(72,92,105,.045)" }),
  stroke: new Stroke({ color: "rgba(54,82,94,.88)", width: 1.8 })
});

const basinLocatorStyle = new Style({
  fill: new Fill({ color: "rgba(214,170,34,.22)" }),
  stroke: new Stroke({ color: "#c79313", width: 2.5 })
});

const basinFinalStyle = new Style({
  fill: new Fill({ color: "rgba(24,112,81,.045)" }),
  stroke: new Stroke({ color: "rgba(31,111,79,.94)", width: 2.2 })
});

const riverStyle = new Style({
  stroke: new Stroke({ color: "rgba(81,196,226,.72)", width: .9 })
});

const stageBounds: Record<"brasil" | "nordeste", [number, number, number, number]> = {
  brasil: [-74.5, -34.5, -34.0, 6.0],
  nordeste: [-48.7, -19.0, -33.8, -1.0]
};

export default function ProjectTerritoryJourney() {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  const basinSourceRef = useRef<VectorSource | null>(null);
  const rnSourceRef = useRef<VectorSource | null>(null);
  const locatorSourceRef = useRef<VectorSource | null>(null);

  const lightBaseRef = useRef<TileLayer<XYZ> | null>(null);
  const lightLabelsRef = useRef<TileLayer<XYZ> | null>(null);
  const satelliteRef = useRef<TileLayer<XYZ> | null>(null);

  const rnLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const basinLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const riversLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const locatorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const stageRef = useRef<StageId>("brasil");

  const [stage, setStage] = useState<StageId>("brasil");
  const [basinReady, setBasinReady] = useState(false);
  const [rnReady, setRnReady] = useState(false);

  const activeIndex = stages.findIndex((item) => item.id === stage);
  const activeStage = stages[activeIndex];

  const updateLayerState = (nextStage: StageId) => {
    const isBasin = nextStage === "bacia";
    const isRn = nextStage === "rn";
    const isNortheast = nextStage === "nordeste";
    const isBrazil = nextStage === "brasil";

    lightBaseRef.current?.setVisible(!isBasin);
    lightLabelsRef.current?.setVisible(!isBasin);
    satelliteRef.current?.setVisible(isBasin);

    rnLayerRef.current?.setVisible(isNortheast || isRn);
    basinLayerRef.current?.setVisible(isRn || isBasin);
    riversLayerRef.current?.setVisible(isBasin);
    locatorLayerRef.current?.setVisible(isBrazil);

    if (rnLayerRef.current) {
      rnLayerRef.current.setStyle(isNortheast ? rnNordesteStyle : rnStateStyle);
    }

    if (basinLayerRef.current) {
      basinLayerRef.current.setStyle(isBasin ? basinFinalStyle : basinLocatorStyle);
    }
  };

  const moveToStage = (nextStage: StageId, animate = true) => {
    const map = mapRef.current;
    if (!map) return;

    stageRef.current = nextStage;
    setStage(nextStage);
    updateLayerState(nextStage);

    const view = map.getView();
    const duration = animate ? 900 : 0;

    if (nextStage === "bacia") {
      const source = basinSourceRef.current;
      if (!source || source.getFeatures().length === 0) return;
      const extent = source.getExtent();
      if (!extent) return;

      view.fit(extent, {
        padding: [54, 62, 54, 62],
        maxZoom: 9.5,
        duration
      });
      return;
    }

    if (nextStage === "rn") {
      const source = rnSourceRef.current;
      if (source && source.getFeatures().length > 0) {
        const extent = source.getExtent();
        if (!extent) return;
        view.fit(extent, {
          padding: [56, 64, 56, 64],
          maxZoom: 7.4,
          duration
        });
        return;
      }

      const fallback = transformExtent(
        [-38.8, -7.25, -34.7, -4.6],
        "EPSG:4326",
        "EPSG:3857"
      );
      view.fit(fallback, {
        padding: [56, 64, 56, 64],
        duration
      });
      return;
    }

    const extent = transformExtent(
      stageBounds[nextStage],
      "EPSG:4326",
      "EPSG:3857"
    );

    view.fit(extent, {
      padding: [50, 58, 50, 58],
      duration
    });
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

    /*
      Camada de contexto estadual.
      O arquivo individual do RN é usado somente para localização cartográfica
      e não substitui nenhuma camada temática do Projeto Potengi.
    */
    const rnSource = new VectorSource({
      url: "https://raw.githubusercontent.com/giuliano-macedo/geodata-br-states/main/geojson/br_states/br_rn.json",
      format
    });

    const locatorSource = new VectorSource();

    basinSourceRef.current = basinSource;
    rnSourceRef.current = rnSource;
    locatorSourceRef.current = locatorSource;

    const lightBase = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous"
      })
    });

    const lightLabels = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous"
      }),
      zIndex: 8
    });

    const satellite = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous"
      }),
      visible: false
    });

    const rnLayer = new VectorLayer({
      source: rnSource,
      style: rnNordesteStyle,
      visible: false,
      zIndex: 3
    });

    const basinLayer = new VectorLayer({
      source: basinSource,
      style: basinLocatorStyle,
      visible: false,
      zIndex: 5
    });

    const riversLayer = new VectorLayer({
      source: riversSource,
      style: riverStyle,
      visible: false,
      zIndex: 6
    });

    const locatorLayer = new VectorLayer({
      source: locatorSource,
      style: locatorStyle,
      visible: true,
      zIndex: 10
    });

    lightBaseRef.current = lightBase;
    lightLabelsRef.current = lightLabels;
    satelliteRef.current = satellite;
    rnLayerRef.current = rnLayer;
    basinLayerRef.current = basinLayer;
    riversLayerRef.current = riversLayer;
    locatorLayerRef.current = locatorLayer;

    const map = new Map({
      target: targetRef.current,
      controls: [],
      layers: [
        lightBase,
        satellite,
        rnLayer,
        basinLayer,
        riversLayer,
        lightLabels,
        locatorLayer
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

    rnSource.once("featuresloadend", () => {
      const extent = rnSource.getExtent();
      if (!extent) return;
      locatorSource.clear();
      locatorSource.addFeature(
        new Feature({
          geometry: new Point(getCenter(extent))
        })
      );
      setRnReady(true);

      if (stageRef.current === "rn") {
        moveToStage("rn", false);
      }
    });

    basinSource.once("featuresloadend", () => {
      setBasinReady(true);

      if (stageRef.current === "bacia") {
        moveToStage("bacia", false);
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
              className={stage === item.id ? styles.journeyStepActive : undefined}
              aria-pressed={stage === item.id}
              onClick={() => moveToStage(item.id)}
            >
              <b>{item.number}</b>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.journeyNarrative} aria-live="polite">
          <span>{activeStage.number} · {activeStage.label.toUpperCase()}</span>
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
              : stage === "rn"
                ? "Contorno estadual de contexto e limite real da Bacia do Rio Potengi."
                : stage === "nordeste"
                  ? "O Rio Grande do Norte é destacado na escala regional."
                  : "A localização começa na escala nacional e avança progressivamente até a bacia."}
          </span>
        </div>
      </aside>

      <div className={styles.journeyMap}>
        <div
          ref={targetRef}
          className={styles.journeyMapCanvas}
          aria-label={`Mapa de localização — ${activeStage.label}`}
        />

        <div className={styles.mapStageBadge}>
          <b>{activeStage.number}</b>
          <span>{activeStage.label}</span>
        </div>

        <small className={styles.mapCredit}>
          {stage === "bacia"
            ? "Imagem: Esri World Imagery"
            : stage === "nordeste" || stage === "rn"
              ? "Base: Esri · contorno RN: fonte cartográfica de contexto"
              : "Base: Esri Light Gray Canvas"}
        </small>
      </div>
    </div>
  );
}
