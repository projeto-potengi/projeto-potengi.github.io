"use client";

import { useEffect, useMemo, useState } from "react";

type Coordinate = [number, number];
type PolygonGeometry = { type: "Polygon"; coordinates: Coordinate[][] };
type MultiPolygonGeometry = { type: "MultiPolygon"; coordinates: Coordinate[][][] };
type LineGeometry = { type: "LineString"; coordinates: Coordinate[] };
type MultiLineGeometry = { type: "MultiLineString"; coordinates: Coordinate[][] };
type TraceGeometry = PolygonGeometry | MultiPolygonGeometry | LineGeometry | MultiLineGeometry;
type Feature = { geometry?: TraceGeometry | null };
type FeatureCollection = { features?: Feature[] };

type TracePath = {
  d: string;
  kind: "basin" | "river";
};

const sourceUrls = [
  { url: "/data/geospatial/limite-bacia.geojson", kind: "basin" as const },
  { url: "/data/geospatial/rios.geojson", kind: "river" as const }
];

function collectLines(geometry: TraceGeometry): Coordinate[][] {
  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "MultiLineString") return geometry.coordinates;
  if (geometry.type === "Polygon") return geometry.coordinates;
  return geometry.coordinates.flatMap((polygon) => polygon);
}

function buildPath(points: Coordinate[], bounds: { minX: number; minY: number; maxX: number; maxY: number }) {
  const width = Math.max(bounds.maxX - bounds.minX, 0.000001);
  const height = Math.max(bounds.maxY - bounds.minY, 0.000001);
  return points
    .map(([x, y], index) => {
      const px = ((x - bounds.minX) / width) * 100;
      const py = 100 - ((y - bounds.minY) / height) * 100;
      return `${index === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(" ");
}

export default function HomeBasinTrace() {
  const [paths, setPaths] = useState<TracePath[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      sourceUrls.map(async ({ url, kind }) => {
        const response = await fetch(url);
        const data = (await response.json()) as FeatureCollection;
        return { kind, data };
      })
    )
      .then((collections) => {
        const lineEntries = collections.flatMap(({ data, kind }) =>
          (data.features ?? []).flatMap((feature) =>
            feature.geometry ? collectLines(feature.geometry).map((line) => ({ kind, line })) : []
          )
        );
        const allPoints = lineEntries.flatMap(({ line }) => line);
        if (!allPoints.length) return;

        const xs = allPoints.map(([x]) => x);
        const ys = allPoints.map(([, y]) => y);
        const bounds = {
          minX: Math.min(...xs),
          minY: Math.min(...ys),
          maxX: Math.max(...xs),
          maxY: Math.max(...ys)
        };

        const nextPaths = lineEntries
          .filter(({ line }) => line.length > 1)
          .map(({ kind, line }) => ({ kind, d: buildPath(line, bounds) }));
        if (!cancelled) setPaths(nextPaths);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const visiblePaths = useMemo(() => paths.slice(0, 130), [paths]);

  return (
    <svg className="home-basin-trace" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {visiblePaths.map((path, index) => (
        <path key={`${path.kind}-${index}`} d={path.d} className={`trace-${path.kind}`} />
      ))}
    </svg>
  );
}
