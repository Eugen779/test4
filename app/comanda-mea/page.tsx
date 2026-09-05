"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getOrderHistory } from "@/lib/order-history";

type Summary = { id: string; order_number: string; status: string; total: number; created_at: string };

const statusLabels: Record<string, string> = {
  noua: "Comandă primită",
  confirmata: "Confirmată",
  in_livrare: "În livrare",
  livrata: "Livrată",
  anulata: "Anulată",
};

const statusColors: Record<string, string> = {
  noua: "bg-navy/10 text-navy",
  confirmata: "bg-blue-100 text-blue-700",
  in_livrare: "bg-amber-100 text-amber-700",
  livrata: "bg-seafoam/20 text-seafoam",
  anulata: "bg-coral/10 text-coral",
};

export default function MyOrdersListPage() {
  const [orders, setOrders] = useState<Summary[] | null>(null);

  useEffect(() => {
    const stored = getOrderHistory();
    if (stored.length === 0) {
      setOrders([]);
      return;
    }

    Promise.all(
      stored.map(async (o) => {
        try {
          const res = await fetch(`/api/my-order?id=${o.id}`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: o.id,
            order_number: o.order_number,
            status: data.order.status,
            total: data.order.total,
            created_at: data.order.created_at,
          } as Summary;
        } catch {
          return null;
        }
      })
    ).then((results) => setOrders(results.filter((r): r is Summary => r !== null)));
  }, []);

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-8 max-w-md mx-auto">
        <h1 className="font-display font-bold text-2xl text-navy mb-4">Comenzile mele</h1>

        {orders === null && <p className="text-navy/50 text-center py-10">Se încarcă...</p>}

        {orders !== null && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-navy/50 mb-4">Nu ai nicio comandă încă pe acest telefon.</p>
            <Link href="/produse" className="text-coral font-semibold">
              Vezi produsele →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {orders?.map((o) => (
            <Link
              key={o.id}
              href={`/comanda-mea/${o.id}`}
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-navy">#{o.order_number}</p>
                <p className="font-display font-bold text-coral">{o.total.toFixed(2)} lei</p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[o.status]}`}>
                  {statusLabels[o.status] ?? o.status}
                </span>
                <span className="text-xs text-navy/40">
                  {new Date(o.created_at).toLocaleDateString("ro-RO")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
