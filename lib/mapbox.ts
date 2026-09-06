export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const CHISINAU_CENTER: [number, number] = [28.8638, 47.0105]; // [lng, lat]

// Conturul real al zonei de livrare — Chișinău + Stăuceni, Grătiești, Durlești, Codru.
// Coordonate aproximative desenate manual în jurul acestor localități (nu e o
// graniță administrativă oficială, dar urmărește forma reală, nu un dreptunghi).
const DELIVERY_ZONE_COORDINATES: [number, number][] = [
  [28.79, 47.115], // nord de Grătiești
  [28.9, 47.105], // nord-est, peste Stăuceni
  [28.965, 47.05], // Ciocana / marginea NE a orașului
  [28.965, 46.995], // marginea de est, Botanica
  [28.92, 46.96], // sud-est, spre Codru
  [28.83, 46.95], // sud de Codru
  [28.775, 46.965], // vest de Codru
  [28.705, 47.005], // vest de Durlești
  [28.72, 47.05], // nord de Durlești
  [28.77, 47.085], // între Durlești și Grătiești
  [28.79, 47.115], // închide conturul
];

export const DELIVERY_ZONE_GEOJSON = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
    coordinates: [DELIVERY_ZONE_COORDINATES],
  },
};

// Verificare "punct în poligon" (ray casting) — exact aceleași limite ca cele desenate pe hartă.
export function isWithinChisinau(lat: number, lng: number): boolean {
  let inside = false;
  const coords = DELIVERY_ZONE_COORDINATES;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

type MapboxFeature = {
  text: string;
  address?: string;
  place_name: string;
  context?: { id: string; text: string }[];
};

// Construiește o adresă scurtă (stradă + număr + oraș/suburbie) dintr-un
// rezultat Mapbox — preferăm "locality" (ex. Durlești, Grătiești) în locul
// lui "place" (Chișinău), ca suburbiile să apară cu numele lor real.
export function formatShortAddress(feature: MapboxFeature): string {
  const street = feature.text;
  const number = feature.address;
  const city =
    feature.context?.find((c) => c.id.startsWith("locality."))?.text ??
    feature.context?.find((c) => c.id.startsWith("place."))?.text ??
    "Chișinău";

  const streetPart = number ? `${street} ${number}` : street;
  return streetPart ? `${streetPart}, ${city}` : city;
}

// Bounding box (folosit doar ca să restrângem sugestiile de căutare Mapbox —
// validarea reală a punctului folosește poligonul de mai sus, mai precis).
export const CHISINAU_BBOX: [number, number, number, number] = [28.65, 46.8, 29.05, 47.2];
