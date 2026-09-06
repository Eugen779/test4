"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/lib/mapbox";

type Stop = { orderId: string; lat: number; lng: number; label: string };

const ROUTE_SOURCE_ID = "courier-route";

export default function CourierRouteMap({
  origin,
  stops,
  onOptimized,
}: {
  origin: { lat: number; lng: number };
  stops: Stop[];
  onOptimized?: (orderedStops: (Stop & { position: number })[], totalMinutes: number) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapDivRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapDivRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [origin.lng, origin.lat],
      zoom: 12,
    });

    map.on("load", () => {
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: ROUTE_SOURCE_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#C8342E", "line-width": 4, "line-opacity": 0.85 },
      });
      setReady(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || stops.length === 0) return;
    const map = mapRef.current;

    // Curier (start) + toate opririle — cerem Mapbox să găsească cea mai
    // bună ordine de vizitare (nu neapărat ordinea în care au fost preluate).
    const coords = [`${origin.lng},${origin.lat}`, ...stops.map((s) => `${s.lng},${s.lat}`)].join(";");

    fetch(
      `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coords}?source=first&roundtrip=false&geometries=geojson&access_token=${MAPBOX_TOKEN}`
    )
      .then((res) => res.json())
      .then((data) => {
        const trip = data.trips?.[0];
        const waypoints = data.waypoints as { waypoint_index: number }[] | undefined;
        if (!trip || !waypoints) return;

        const source = map.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
        source?.setData({ type: "Feature", properties: {}, geometry: trip.geometry });

        // waypoints[0] e mereu punctul de start (curierul) — restul, în ordinea
        // introdusă de noi, ne spun poziția lor optimă în traseu (waypoint_index).
        const orderedStops = stops
          .map((stop, i) => ({ ...stop, position: waypoints[i + 1].waypoint_index }))
          .sort((a, b) => a.position - b.position);

        if (onOptimized) onOptimized(orderedStops, Math.round(trip.duration / 60));

        // marcaje numerotate, în ordinea optimă
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const originEl = document.createElement("div");
        originEl.innerHTML = '<div style="font-size:24px">🚗</div>';
        markersRef.current.push(new mapboxgl.Marker({ element: originEl }).setLngLat([origin.lng, origin.lat]).addTo(map));

        orderedStops.forEach((s, i) => {
          const el = document.createElement("div");
          el.style.cssText =
            "background:#C8342E;color:#FBF6EC;width:26px;height:26px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)";
          el.textContent = String(i + 1);
          markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat([s.lng, s.lat]).addTo(map));
        });

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([origin.lng, origin.lat]);
        stops.forEach((s) => bounds.extend([s.lng, s.lat]));
        map.fitBounds(bounds, { padding: 60 });
      })
      .catch(() => {
        // traseul nu s-a putut optimiza — curierul poate livra oricum, în ordinea din listă
      });
  }, [ready, origin.lat, origin.lng, stops]);

  if (!MAPBOX_TOKEN) {
    return <p className="text-coral text-sm">Harta nu este configurată (lipsește cheia Mapbox).</p>;
  }

  return <div ref={mapDivRef} className="w-full h-72 rounded-2xl overflow-hidden border border-kraftDark/30 shadow-sm" />;
}
