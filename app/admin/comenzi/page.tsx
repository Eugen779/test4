import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import type { Order, OrderStatus } from "@/lib/types";

export const revalidate = 0;

const statusStyles: Record<OrderStatus, string> = {
  noua: "border-l-4 border-l-navy/20 bg-white",
  confirmata: "border-l-4 border-l-blue-400 bg-blue-50/50",
  in_livrare: "border-l-4 border-l-amber-400 bg-amber-50/50",
  livrata: "border-l-4 border-l-seafoam bg-seafoam/10",
  anulata: "border-l-4 border-l-coral bg-coral/5 opacity-70",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const activeFilter = filter === "azi" ? "azi" : "toate";

  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  const allOrders = (orders as Order[]) ?? [];
  const todayStr = new Date().toDateString();
  const visibleOrders =
    activeFilter === "azi"
      ? allOrders.filter((o) => new Date(o.created_at).toDateString() === todayStr)
      : allOrders;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-4">Comenzi</h1>

      <div className="flex gap-2 mb-5">
        <Link
          href="/admin/comenzi"
          className={`text-sm font-semibold px-4 py-2 rounded-full ${
            activeFilter === "toate" ? "bg-coral text-cream" : "bg-white text-navy border border-kraftDark"
          }`}
        >
          Toate ({allOrders.length})
        </Link>
        <Link
          href="/admin/comenzi?filter=azi"
          className={`text-sm font-semibold px-4 py-2 rounded-full ${
            activeFilter === "azi" ? "bg-coral text-cream" : "bg-white text-navy border border-kraftDark"
          }`}
        >
          Azi ({allOrders.filter((o) => new Date(o.created_at).toDateString() === todayStr).length})
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden divide-y divide-kraft shadow-sm">
        {visibleOrders.map((o) => (
          <div key={o.id} className={`p-4 hover:brightness-95 transition-all ${statusStyles[o.status]}`}>
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
        {visibleOrders.length === 0 && (
          <p className="p-6 text-center text-navy/50 bg-white">Nicio comandă {activeFilter === "azi" ? "azi" : "încă"}.</p>
        )}
      </div>
    </div>
  );
}
