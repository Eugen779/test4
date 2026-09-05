"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Iconițe simple, cu emoji — mai plăcute vizual decât pinii impliciți Leaflet
// și nu au nevoie de imagini externe care se pot rupe la build.
const driverIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1">🚗</div>',
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});
const destinationIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1">📍</div>',
  className: "",
  iconSize: [26, 32],
  iconAnchor: [13, 32],
});

type LatLng = { lat: number; lng: number };

function FitToMarkers({ driver, destination }: { driver: LatLng; destination?: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (destination) {
      map.fitBounds(
        [
          [driver.lat, driver.lng],
          [destination.lat, destination.lng],
        ],
        { padding: [40, 40] }
      );
    } else {
      map.setView([driver.lat, driver.lng], 15);
    }
  }, [driver.lat, driver.lng, destination?.lat, destination?.lng, map]);
  return null;
}

export default function DeliveryMap({
  driver,
  destination,
  route,
}: {
  driver: LatLng;
  destination?: LatLng;
  route?: [number, number][];
}) {
  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-kraftDark/30 shadow-sm">
      <MapContainer center={[driver.lat, driver.lng]} zoom={15} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
        {/* Stil de hartă simplu și curat (CartoDB Positron) — fără aglomerare vizuală */}
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {route && route.length > 1 && <Polyline positions={route} pathOptions={{ color: "#C8342E", weight: 4, opacity: 0.85 }} />}
        <Marker position={[driver.lat, driver.lng]} icon={driverIcon} />
        {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />}
        <FitToMarkers driver={driver} destination={destination} />
      </MapContainer>
    </div>
  );
}
