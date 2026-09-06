"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, CHISINAU_BBOX, CHISINAU_CENTER, isWithinChisinau, formatShortAddress, DELIVERY_ZONE_GEOJSON } from "@/lib/mapbox";

export default function AddressMapPicker({
  address,
  confirmed,
  onConfirm,
  onReset,
}: {
  address: string;
  confirmed: boolean;
  onConfirm: (data: { address: string; lat: number; lng: number }) => void;
  onReset: () => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState(address);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [outOfArea, setOutOfArea] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      setTokenMissing(true);
      return;
    }
    if (!mapDivRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapDivRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: CHISINAU_CENTER,
      zoom: 11,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("delivery-zone", { type: "geojson", data: DELIVERY_ZONE_GEOJSON });
      map.addLayer({
        id: "delivery-zone-fill",
        type: "fill",
        source: "delivery-zone",
        paint: { "fill-color": "#F59E0B", "fill-opacity": 0.15 },
      });
      map.addLayer({
        id: "delivery-zone-line",
        type: "line",
        source: "delivery-zone",
        paint: { "line-color": "#F59E0B", "line-width": 3, "line-dasharray": [2, 2] },
      });
    });

    map.on("click", (e) => {
      placeMarkerAndReverseGeocode(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setMarker(lat: number, lng: number) {
    if (!mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: "#C8342E", draggable: true })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLngLat();
        placeMarkerAndReverseGeocode(pos.lat, pos.lng, false);
      });
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }
    mapRef.current.flyTo({ center: [lng, lat], zoom: 16 });
  }

  async function placeMarkerAndReverseGeocode(lat: number, lng: number, movePin = true) {
    if (!isWithinChisinau(lat, lng)) {
      setOutOfArea(true);
      return;
    }
    setOutOfArea(false);
    if (movePin) setMarker(lat, lng);

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address`
      );
      const data = await res.json();
      const feature = data.features?.[0];
      const shortAddress = feature ? formatShortAddress(feature) : `Locație pe hartă (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      setQuery(shortAddress);
      onConfirm({ address: shortAddress, lat, lng });
    } catch {
      onConfirm({ address: `Locație pe hartă (${lat.toFixed(5)}, ${lng.toFixed(5)})`, lat, lng });
    }
  }

  function handleQueryChange(v: string) {
    setQuery(v);
    if (confirmed) onReset();

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(v)}.json?access_token=${MAPBOX_TOKEN}&bbox=${CHISINAU_BBOX.join(
            ","
          )}&country=md&limit=6`
        );
        const data = await res.json();
        setSuggestions(data.features ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 450);
  }

  function selectSuggestion(feature: any) {
    const [lng, lat] = feature.center;
    if (!isWithinChisinau(lat, lng)) {
      setOutOfArea(true);
      return;
    }
    setOutOfArea(false);
    setMarker(lat, lng);
    const shortAddress = formatShortAddress(feature);
    setQuery(shortAddress);
    onConfirm({ address: shortAddress, lat, lng });
    setOpen(false);
    setSuggestions([]);
  }

  if (tokenMissing) {
    return <p className="text-coral text-sm">Harta nu este configurată (lipsește cheia Mapbox).</p>;
  }

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Caută strada, sau apasă direct pe hartă"
          className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white mb-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-20 left-0 right-0 bg-white border border-kraftDark rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {suggestions.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(f)}
                className="block w-full text-left px-3 py-2 text-sm text-navy hover:bg-kraft/30 border-b border-kraft last:border-0"
              >
                {f.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={mapDivRef} className="w-full h-56 rounded-xl overflow-hidden border border-kraftDark/30" />
      <p className="text-xs text-navy/40 mt-1">
        Zona portocalie punctată arată aria de livrare (Chișinău, Stăuceni, Grătiești, Hulboaca, Ghidighici, Durlești, Codru — fără Cricova).
      </p>

      {outOfArea && (
        <p className="text-xs text-coral mt-1">Livrăm doar în Chișinău și suburbii — alege un punct din această zonă.</p>
      )}
      {confirmed && !outOfArea && (
        <p className="text-xs text-seafoam font-semibold mt-1">✓ Adresă confirmată: {query}</p>
      )}
    </div>
  );
}
