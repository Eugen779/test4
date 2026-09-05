let loadPromise: Promise<void> | null = null;

// Încarcă scriptul Google Maps o singură dată, indiferent de câte componente
// îl cer — restul apelurilor primesc aceeași promisiune deja rezolvată.
export function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    if ((window as any).google?.maps) {
      resolve();
      return;
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      reject(new Error("Lipsește NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=ro&region=MD`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps nu s-a putut încărca"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

// Limitele Chișinău + suburbii — folosite ca să restrângem sugestiile de
// adrese și marcajele de pe hartă strict la zona de livrare.
export const CHISINAU_BOUNDS = {
  south: 46.8,
  west: 28.65,
  north: 47.2,
  east: 29.05,
};

export function isWithinChisinau(lat: number, lng: number) {
  return (
    lat >= CHISINAU_BOUNDS.south &&
    lat <= CHISINAU_BOUNDS.north &&
    lng >= CHISINAU_BOUNDS.west &&
    lng <= CHISINAU_BOUNDS.east
  );
}

// Construiește o adresă scurtă din componentele Google (stradă + număr + oraș),
// nu textul lung/complet cu județ, cod poștal, țară etc.
export function formatShortAddress(components: google.maps.GeocoderAddressComponent[]): string {
  const get = (type: string) => components.find((c) => c.types.includes(type))?.long_name;

  const street = get("route");
  const number = get("street_number");
  const city = get("locality") || get("sublocality") || get("administrative_area_level_2") || "Chișinău";

  const streetPart = street ? (number ? `${street} ${number}` : street) : null;
  return streetPart ? `${streetPart}, ${city}` : city;
}
