import { createClient } from "@/lib/supabase-server";
import CheckoutClient from "@/components/CheckoutClient";
import type { Settings, DeliverySlot } from "@/lib/types";

export const revalidate = 30;

export default async function CheckoutPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: slots }] = await Promise.all([
    supabase.from("settings").select("min_order_enabled, min_order_amount").eq("id", 1).single(),
    supabase.from("delivery_slots").select("*").eq("is_active", true).order("day_of_week").order("start_time"),
  ]);

  const s = settings as Pick<Settings, "min_order_enabled" | "min_order_amount"> | null;

  return (
    <CheckoutClient
      minOrderEnabled={s?.min_order_enabled ?? false}
      minOrderAmount={s?.min_order_amount ?? 250}
      deliverySlots={(slots as DeliverySlot[]) ?? []}
    />
  );
}
