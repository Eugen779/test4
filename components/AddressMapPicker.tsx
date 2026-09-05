"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, isWithinChisinau, formatShortAddress } from "@/lib/google-maps";

const CHISINAU_CENTER = { lat: 47.0105, lng: 28.8638 };

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
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [outOfArea, setOutOfArea] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapDivRef.current) return;

        const bounds = new google.maps.LatLngBounds(
          { lat: 46.8, lng: 28.65 },
          { lat: 47.2, lng: 29.05 }
        );

        const map = new google.maps.Map(mapDivRef.current, {
          center: CHISINAU_CENTER,
          zoom: 12,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;
        geocoderRef.current = new google.maps.Geocoder();

        const marker = new google.maps.Marker({
          map,
          draggable: true,
          position: CHISINAU_CENTER,
          visible: false,
        });
        markerRef.current = marker;

        // Click direct pe hartă — pune/mută marcajul acolo și îi caută adresa.
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          placeMarkerAndReverseGeocode(e.latLng);
        });
        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) placeMarkerAndReverseGeocode(pos);
        });

        // Căutare (autocomplete), restrânsă la Chișinău + suburbii.
        if (inputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            bounds,
            strictBounds: true,
            componentRestrictions: { country: "md" },
            fields: ["geometry", "address_components"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const loc = place.geometry?.location;
            if (!loc) return;
            const lat = loc.lat();
            const lng = loc.lng();
            if (!isWithinChisinau(lat, lng)) {
              setOutOfArea(true);
              return;
            }
            setOutOfArea(false);
            marker.setPosition(loc);
            marker.setVisible(true);
            map.panTo(loc);
            map.setZoom(16);
            const shortAddress = place.address_components
              ? formatShortAddress(place.address_components)
              : inputRef.current!.value;
            onConfirm({ address: shortAddress, lat, lng });
          });
        }

        setReady(true);
      })
      .catch((err) => setLoadError(err.message));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeMarkerAndReverseGeocode(latLng: google.maps.LatLng) {
    const lat = latLng.lat();
    const lng = latLng.lng();

    if (!isWithinChisinau(lat, lng)) {
      setOutOfArea(true);
      return;
    }
    setOutOfArea(false);

    markerRef.current?.setPosition(latLng);
    markerRef.current?.setVisible(true);

    geocoderRef.current?.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const shortAddress = formatShortAddress(results[0].address_components);
        onConfirm({ address: shortAddress, lat, lng });
      } else {
        onConfirm({ address: `Locație pe hartă (${lat.toFixed(5)}, ${lng.toFixed(5)})`, lat, lng });
      }
    });
  }

  if (loadError) {
    return <p className="text-coral text-sm">Harta nu s-a putut încărca: {loadError}</p>;
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        defaultValue={address}
        onChange={() => {
          if (confirmed) onReset();
        }}
        placeholder="Caută strada, sau apasă direct pe hartă"
        className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white mb-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
      />

      <div ref={mapDivRef} className="w-full h-56 rounded-xl overflow-hidden border border-kraftDark/30" />

      {!ready && <p className="text-xs text-navy/40 mt-1">Se încarcă harta...</p>}
      {outOfArea && (
        <p className="text-xs text-coral mt-1">Livrăm doar în Chișinău și suburbii — alege un punct din această zonă.</p>
      )}
      {confirmed && !outOfArea && (
        <p className="text-xs text-seafoam font-semibold mt-1">✓ Adresă confirmată: {address}</p>
      )}
    </div>
  );
}
