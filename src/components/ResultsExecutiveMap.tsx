"use client";

import { useEffect, useRef } from "react";
import Feature from "ol/Feature";
import Map from "ol/Map";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import Point from "ol/geom/Point";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";
import styles from "@/app/resultados/resultados.module.css";

/*
  Coordenadas das sedes municipais publicadas em mapas municipais do IBGE:
  Cerro Corá: -6.046, -36.346
  São Tomé:   -5.97,  -36.07
  Macaíba:    -5.86,  -35.36
*/
const municipalities = [
  { name: "Cerro Corá", lon: -36.346, lat: -6.046 },
  { name: "São Tomé", lon: -36.07, lat: -5.97 },
  { name: "Macaíba", lon: -35.36, lat: -5.86 }
];

const basinStyle = new Style({
  fill: new Fill({ color: "rgba(46, 139, 87, .10)" }),
  stroke: new Stroke({ color: "#2b865d", width: 2.2 })
});

const riverStyle = new Style({
  stroke: new Stroke({ color: "rgba(16, 132, 162, .68)", width: 1.05 })
});

const cityStyle = (name: string) =>
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: "#d8ad24" }),
      stroke: new Stroke({ color: "#ffffff", width: 2 })
    }),
    text: new Text({
      text: name,
      offsetY: -16,
      font: "700 12px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fill: new Fill({ color: "#17383d" }),
      stroke: new Stroke({ color: "rgba(255,255,255,.96)", width: 4 })
    })
  });

export default function ResultsExecutiveMap() {
  const targetRef = useRef<HTMLDivElement | null>(null);

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

    const municipalitySource = new VectorSource({
      features: municipalities.map((item) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([item.lon, item.lat])),
          name: item.name
        });
        feature.setStyle(cityStyle(item.name));
        return feature;
      })
    });

    const map = new Map({
      target: targetRef.current,
      controls: [],
      layers: [
        new TileLayer({ source: new OSM(), opacity: .47 }),
        new VectorLayer({ source: basinSource, style: basinStyle, zIndex: 2 }),
        new VectorLayer({ source: riversSource, style: riverStyle, zIndex: 3 }),
        new VectorLayer({ source: municipalitySource, zIndex: 4 })
      ],
      view: new View({
        center: fromLonLat([-35.84, -5.96]),
        zoom: 8,
        minZoom: 7,
        maxZoom: 11
      })
    });

    const fit = () => {
      const extent = basinSource.getExtent();
      if (!extent || extent.some((value) => !Number.isFinite(value))) return;
      map.getView().fit(extent, {
        padding: [38, 54, 42, 54],
        maxZoom: 9.3,
        duration: 0
      });
    };

    basinSource.once("featuresloadend", fit);
    if (basinSource.getFeatures().length) fit();

    return () => map.setTarget(undefined);
  }, []);

  return (
    <div className={styles.mapShell}>
      <div
        ref={targetRef}
        className={styles.map}
        aria-label="Mapa da Bacia Hidrográfica do Rio Potengi com Cerro Corá, São Tomé e Macaíba destacados"
      />
      <div className={styles.mapLegend} aria-label="Legenda do mapa">
        <span><i className={styles.basinSwatch} /> Limite da bacia</span>
        <span><i className={styles.riverSwatch} /> Rede hidrográfica</span>
        <span><i className={styles.citySwatch} /> Sedes municipais</span>
      </div>
      <small className={styles.mapSource}>
        Base: OpenStreetMap · limite e rede hidrográfica do Projeto Potengi · sedes municipais: IBGE
      </small>
    </div>
  );
}
