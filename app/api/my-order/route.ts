import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Endpoint public, dar limitat strict: cine cunoaște ID-ul exact al unei
// comenzi (salvat automat pe telefonul clientului la finalizare) poate vedea
// STRICT acea comandă — niciodată lista tuturor comenzilor. Folosim cheia
// "service role" (server-only) tocmai ca să putem controla exact ce se
// întoarce, fără să facem comenzile vizibile public în Supabase (RLS).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "ID invalid" }, { status: 400 });
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, status, total, delivery_slot, current_lat, current_lng, location_updated_at, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Comanda nu a fost găsită" }, { status: 404 });
  }

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_name, quantity, unit_price, subtotal")
    .eq("order_id", id);

  return NextResponse.json({ order, items: items ?? [] });
}
