import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import type { Order } from "@/lib/types";

export const revalidate = 0;

const statusLabels: Record<string, string> = {
  noua: "Nouă",
  confirmata: "Confirmată",
  in_livrare: "În livrare",
  livrata: "Livrată",
  anulata: "Anulată",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-5">Comenzi</h1>

      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-kraft shadow-sm">
        {((orders as Order[]) ?? []).map((o) => (
          <div key={o.id} className="p-4 hover:bg-kraft/10 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-navy">#{o.order_number}</p>
              <p className="font-display font-bold text-coral">{o.total.toFixed(2)} lei</p>
            </div>
            <p className="text-sm text-navy/70">{o.customer_name} · {o.customer_phone}</p>
            <p className="text-sm text-navy/50">{o.customer_address}</p>
            <div className="mt-2 flex items-center justify-between">
              <OrderStatusSelect orderId={o.id} status={o.status} />
              <Link href={`/admin/comenzi/${o.id}`} className="text-coral text-sm font-semibold">
                Vezi produsele →
              </Link>
            </div>
          </div>
        ))}
        {(!orders || orders.length === 0) && (
          <p className="p-6 text-center text-navy/50">Nicio comandă încă.</p>
        )}
      </div>
    </div>
  );
}
