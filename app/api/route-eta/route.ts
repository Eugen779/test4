import { NextResponse } from "next/server";

// Calculează traseul rutier și timpul estimat între tine (livrator) și
// adresa clientului, folosind un serviciu de rutare gratuit (OSRM), fără
// nevoie de cheie API.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const oLat = searchParams.get("oLat");
  const oLng = searchParams.get("oLng");
  const dLat = searchParams.get("dLat");
  const dLng = searchParams.get("dLng");

  if (!oLat || !oLng || !dLat || !dLng) {
    return NextResponse.json({ error: "Lipsesc coordonatele" }, { status: 400 });
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return NextResponse.json({ error: "Serviciul de rutare nu răspunde" }, { status: 502 });

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return NextResponse.json({ error: "Nicio rută găsită" }, { status: 404 });

    const coordinates = (route.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]);

    return NextResponse.json({
      coordinates,
      durationSeconds: route.duration,
      distanceMeters: route.distance,
    });
  } catch {
    return NextResponse.json({ error: "Eroare la calculul traseului" }, { status: 502 });
  }
}
