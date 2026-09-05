"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps";

type LatLng = { lat: number; lng: number };

export default function DeliveryMapGoogle({
  driver,
  destination,
  onEta,
}: {
  driver: LatLng;
  destination?: LatLng;
  onEta?: (data: { minutes: number; km: number }) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [ready, setReady] = useState(false);

  // Inițializare hartă — o singură dată.
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !mapDivRef.current) return;

      const map = new google.maps.Map(mapDivRef.current, {
        center: driver,
        zoom: 14,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          // Stil discret, curat — mai puține etichete/culori stridente decât harta implicită.
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });
      mapRef.current = map;

      driverMarkerRef.current = new google.maps.Marker({
        map,
        position: driver,
        label: { text: "🚗", fontSize: "20px" },
      });

      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: { strokeColor: "#C8342E", strokeWeight: 4, strokeOpacity: 0.85 },
      });

      setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizează marcajul livratorului + destinația + traseul, de fiecare dată
  // când se schimbă poziția (la fiecare 5 secunde, din pagina care urmărește comanda).
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    driverMarkerRef.current?.setPosition(driver);

    if (destination) {
      if (!destMarkerRef.current) {
        destMarkerRef.current = new google.maps.Marker({
          map: mapRef.current,
          position: destination,
          label: { text: "📍", fontSize: "20px" },
        });
      } else {
        destMarkerRef.current.setPosition(destination);
      }

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: driver,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRendererRef.current?.setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg && onEta) {
              const seconds = (leg.duration_in_traffic ?? leg.duration)?.value ?? 0;
              const meters = leg.distance?.value ?? 0;
              onEta({ minutes: Math.round(seconds / 60), km: Math.round((meters / 1000) * 10) / 10 });
            }
          }
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(driver);
          bounds.extend(destination);
          mapRef.current?.fitBounds(bounds, 50);
        }
      );
    } else {
      mapRef.current.panTo(driver);
    }
  }, [ready, driver.lat, driver.lng, destination?.lat, destination?.lng]);

  return <div ref={mapDivRef} className="w-full h-72 rounded-2xl overflow-hidden border border-kraftDark/30 shadow-sm" />;
}
