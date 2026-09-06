"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import Header from "@/components/Header";

const DeliveryMapMapbox = dynamic(() => import("@/components/DeliveryMapMapbox"), { ssr: false });

type OrderData = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  delivery_slot: string | null;
  current_lat: number | null;
  current_lng: number | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  created_at: string;
};

type OrderItem = { product_name: string; quantity: number; unit_price: number; subtotal: number };

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

export default function MyOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [eta, setEta] = useState<{ minutes: number; km: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/my-order?id=${params.id}`);
        if (!res.ok) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setOrder(data.order);
          setItems(data.items);
        }
      } catch {
        // conexiune momentan indisponibilă — încercăm din nou la următoarea rundă
      }
    }

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [params.id]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-cream">
        <Header />
        <div className="px-4 pt-16 pb-16 text-center max-w-sm mx-auto">
          <p className="text-navy/60 mb-4">Comanda nu a fost găsită.</p>
          <Link href="/comanda-mea" className="text-coral font-semibold">
            ← Înapoi la comenzile mele
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-cream">
        <Header />
        <div className="px-4 pt-16 text-center text-navy/50">Se încarcă...</div>
      </main>
    );
  }

  const showLiveMap = order.status === "in_livrare" && order.current_lat != null && order.current_lng != null;

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-8 max-w-md mx-auto">
        <Link href="/comanda-mea" className="text-coral text-sm font-semibold mb-3 inline-block">
          ← Comenzile mele
        </Link>
        <h1 className="font-display font-bold text-2xl text-navy mb-1">#{order.order_number}</h1>

        <span className={`inline-block text-sm font-semibold px-3 py-1.5 rounded-full mb-5 ${statusColors[order.status]}`}>
          {statusLabels[order.status] ?? order.status}
        </span>

        {showLiveMap && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-navy">📍 Livrarea e pe drum</p>
              {eta && (
                <p className="text-sm font-bold text-coral">
                  ~{eta.minutes} min <span className="text-navy/50 font-normal">· {eta.km} km</span>
                </p>
              )}
            </div>
            <DeliveryMapMapbox
              driver={{ lat: order.current_lat!, lng: order.current_lng! }}
              destination={
                order.delivery_lat != null && order.delivery_lng != null
                  ? { lat: order.delivery_lat, lng: order.delivery_lng }
                  : undefined
              }
              onEta={setEta}
            />
            <p className="text-xs text-navy/40 mt-1">Locația și timpul (cu trafic) se actualizează automat.</p>
          </div>
        )}

        {order.delivery_slot && (
          <p className="text-sm text-navy/70 mb-3">
            <span className="font-semibold text-navy">Interval livrare:</span> {order.delivery_slot}
          </p>
        )}

        <div className="bg-white rounded-2xl overflow-hidden divide-y divide-kraft shadow-sm mt-4">
          <p className="px-5 py-3 font-display font-bold text-navy">Produse comandate</p>
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-semibold text-navy text-sm">{item.product_name}</p>
                <p className="text-xs text-navy/50">
                  {item.quantity} × {item.unit_price.toFixed(2)} lei
                </p>
              </div>
              <p className="font-display font-bold text-coral text-sm">{item.subtotal.toFixed(2)} lei</p>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-4 bg-kraft/20">
            <span className="font-display font-bold text-navy">Total</span>
            <span className="font-display font-bold text-coral">{order.total.toFixed(2)} lei</span>
          </div>
        </div>
      </div>
    </main>
  );
}
