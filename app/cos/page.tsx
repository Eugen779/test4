import { createClient } from "@/lib/supabase-server";
import CartClient from "@/components/CartClient";
import type { Settings } from "@/lib/types";

export const revalidate = 30;

export default async function CartPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("min_order_enabled, min_order_amount")
    .eq("id", 1)
    .single();

  const s = settings as Pick<Settings, "min_order_enabled" | "min_order_amount"> | null;

  return (
    <CartClient
      minOrderEnabled={s?.min_order_enabled ?? false}
      minOrderAmount={s?.min_order_amount ?? 250}
    />
  );
}
