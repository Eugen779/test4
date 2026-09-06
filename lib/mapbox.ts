export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// [minLng, minLat, maxLng, maxLat] — Chișinău + suburbii
export const CHISINAU_BBOX: [number, number, number, number] = [28.65, 46.8, 29.05, 47.2];
export const CHISINAU_CENTER: [number, number] = [28.8638, 47.0105]; // [lng, lat]

export function isWithinChisinau(lat: number, lng: number) {
  const [minLng, minLat, maxLng, maxLat] = CHISINAU_BBOX;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

type MapboxFeature = {
  text: string;
  address?: string;
  place_name: string;
  context?: { id: string; text: string }[];
};

// Construiește o adresă scurtă (stradă + număr + oraș) dintr-un rezultat
// Mapbox, nu textul lung/complet cu regiune, cod poștal, țară etc.
export function formatShortAddress(feature: MapboxFeature): string {
  const street = feature.text;
  const number = feature.address;
  const city = feature.context?.find((c) => c.id.startsWith("place."))?.text ?? "Chișinău";

  const streetPart = number ? `${street} ${number}` : street;
  return streetPart ? `${streetPart}, ${city}` : city;
}
