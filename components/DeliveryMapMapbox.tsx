"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN } from "@/lib/mapbox";

type LatLng = { lat: number; lng: number };

const ROUTE_SOURCE_ID = "delivery-route";

export default function DeliveryMapMapbox({
  driver,
  destination,
  onEta,
}: {
  driver: LatLng;
  destination?: LatLng;
  onEta?: (data: { minutes: number; km: number }) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [ready, setReady] = useState(false);

  // Inițializare hartă — o singură dată.
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapDivRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapDivRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [driver.lng, driver.lat],
      zoom: 14,
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
    driverMarkerRef.current = new mapboxgl.Marker({ color: "#16233D" }).setLngLat([driver.lng, driver.lat]).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La fiecare schimbare de poziție — mutăm marcajele și recalculăm traseul
  // (cu profil "driving-traffic", care ține cont de ambuteiajele curente).
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const map = mapRef.current;

    driverMarkerRef.current?.setLngLat([driver.lng, driver.lat]);

    if (!destination) {
      map.flyTo({ center: [driver.lng, driver.lat] });
      return;
    }

    if (!destMarkerRef.current) {
      destMarkerRef.current = new mapboxgl.Marker({ color: "#C8342E" }).setLngLat([destination.lng, destination.lat]).addTo(map);
    } else {
      destMarkerRef.current.setLngLat([destination.lng, destination.lat]);
    }

    fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${driver.lng},${driver.lat};${destination.lng},${destination.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
    )
      .then((res) => res.json())
      .then((data) => {
        const route = data.routes?.[0];
        if (!route) return;

        const source = map.getSource(ROUTE_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
        source?.setData({ type: "Feature", properties: {}, geometry: route.geometry });

        if (onEta) {
          onEta({ minutes: Math.round(route.duration / 60), km: Math.round((route.distance / 1000) * 10) / 10 });
        }

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([driver.lng, driver.lat]);
        bounds.extend([destination.lng, destination.lat]);
        map.fitBounds(bounds, { padding: 60 });
      })
      .catch(() => {
        // traseul nu s-a putut calcula — marcajele rămân vizibile oricum
      });
  }, [ready, driver.lat, driver.lng, destination?.lat, destination?.lng]);

  if (!MAPBOX_TOKEN) {
    return <p className="text-coral text-sm">Harta nu este configurată (lipsește cheia Mapbox).</p>;
  }

  return <div ref={mapDivRef} className="w-full h-72 rounded-2xl overflow-hidden border border-kraftDark/30 shadow-sm" />;
}
