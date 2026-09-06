import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function isValidPin(pin: string) {
  const { data } = await supabaseAdmin.from("settings").select("courier_pin").eq("id", 1).single();
  return data?.courier_pin === pin;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, pin } = body;

  if (!pin || !(await isValidPin(pin))) {
    return NextResponse.json({ error: "Cod incorect" }, { status: 401 });
  }

  if (action === "verify") {
    return NextResponse.json({ ok: true });
  }

  if (action === "claim") {
    const { orderId, courierName } = body;
    if (!orderId || !courierName) return NextResponse.json({ error: "Date lipsă" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ courier_name: courierName, status: "in_livrare" })
      .eq("id", orderId)
      .eq("status", "confirmata")
      .is("courier_name", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "deliver") {
    const { orderId } = body;
    if (!orderId) return NextResponse.json({ error: "Date lipsă" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: "livrata", current_lat: null, current_lng: null, location_updated_at: null })
      .eq("id", orderId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === "location") {
    const { courierName, lat, lng } = body;
    if (!courierName || lat == null || lng == null) return NextResponse.json({ error: "Date lipsă" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ current_lat: lat, current_lng: lng, location_updated_at: new Date().toISOString() })
      .eq("courier_name", courierName)
      .eq("status", "in_livrare");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acțiune necunoscută" }, { status: 400 });
}
