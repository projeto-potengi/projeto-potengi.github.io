"use client";

import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import GeoJSON from "ol/format/GeoJSON";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";

export default function BasinOverview() {
  const element = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!element.current || mapRef.current) return;

    const basinSource = new VectorSource();
    const riverSource = new VectorSource();
    const basinLayer = new VectorLayer({
      source: basinSource,
      style: new Style({
        stroke: new Stroke({ color: "#0796bd", width: 2.2 }),
        fill: new Fill({ color: "rgba(7, 150, 189, 0.11)" })
      })
    });
    const riverLayer = new VectorLayer({
      source: riverSource,
      style: new Style({
        stroke: new Stroke({ color: "#22b8e7", width: 1.5 })
      })
    });

    const map = new Map({
      target: element.current,
      controls: [],
      interactions: [],
      layers: [basinLayer, riverLayer],
      view: new View({ center: [-3990000, -640000], zoom: 8, minZoom: 6, maxZoom: 10 })
    });

    Promise.all([
      fetch("/data/geospatial/limite-bacia.geojson").then((response) => response.json()),
      fetch("/data/geospatial/rios.geojson").then((response) => response.json())
    ])
      .then(([basin, rivers]) => {
        const format = new GeoJSON();
        basinSource.addFeatures(format.readFeatures(basin, { featureProjection: "EPSG:3857" }));
        riverSource.addFeatures(format.readFeatures(rivers, { featureProjection: "EPSG:3857" }));
        const extent = basinSource.getExtent();
        if (extent) map.getView().fit(extent, { padding: [22, 22, 22, 22], duration: 450 });
      })
      .catch(() => undefined);

    mapRef.current = map;
    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="basin-overview">
      <div ref={element} className="basin-overview-map" aria-label="Representação cartográfica da bacia do Rio Potengi" />
      <div className="basin-overview-caption">
        <strong>Bacia do Rio Potengi</strong>
        <span>Limite e rede hidrográfica processados para navegação web.</span>
      </div>
    </div>
  );
}
