import { NextResponse } from "next/server";

// Căutare de adrese prin OpenStreetMap (Nominatim), limitată strict la
// Chișinău și suburbii — orice adresă din afara acestei zone nu apare deloc
// în sugestii, deci clientul nu poate finaliza comanda cu o adresă greșită.
const CHISINAU_VIEWBOX = "28.65,47.20,29.05,46.80"; // vest,nord,est,sud

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url =
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}` +
    `&viewbox=${CHISINAU_VIEWBOX}&bounded=1&countrycodes=md&limit=6`;

  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim cere un User-Agent identificabil — fără el, poate refuza cererile.
        "User-Agent": "OceanProdus-Magazin/1.0",
      },
    });
    if (!res.ok) return NextResponse.json({ results: [] });

    const data = await res.json();
    const results = (data as any[]).map((r) => ({
      display_name: r.display_name as string,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
