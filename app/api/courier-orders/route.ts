import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Folosește cheia service-role — curierii nu au cont Supabase Auth propriu,
// deci accesul se face prin acest endpoint controlat, nu direct pe tabel.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courierName = searchParams.get("courier");

  const [{ data: available }, { data: mine }] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_name, customer_phone, customer_address, delivery_lat, delivery_lng, delivery_slot, total")
      .eq("status", "confirmata")
      .is("courier_name", null)
      .order("created_at"),
    courierName
      ? supabaseAdmin
          .from("orders")
          .select("id, order_number, customer_name, customer_phone, customer_address, delivery_lat, delivery_lng, delivery_slot, total")
          .eq("status", "in_livrare")
          .eq("courier_name", courierName)
          .order("created_at")
      : Promise.resolve({ data: [] }),
  ]);

  return NextResponse.json({ available: available ?? [], mine: mine ?? [] });
}
