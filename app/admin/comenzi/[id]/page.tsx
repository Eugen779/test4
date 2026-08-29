import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import type { Order, OrderItem } from "@/lib/types";

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (!order) {
    return <p className="text-navy/50">Comanda nu a fost găsită.</p>;
  }

  const o = order as Order;

  return (
    <div className="max-w-xl">
      <Link href="/admin/comenzi" className="text-coral text-sm font-semibold mb-4 inline-block">
        ← Înapoi la comenzi
      </Link>

      <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display font-bold text-xl text-navy">#{o.order_number}</h1>
          <OrderStatusSelect orderId={o.id} status={o.status} />
        </div>
        <div className="text-sm text-navy/70 space-y-0.5">
          <p><span className="font-semibold text-navy">Client:</span> {o.customer_name}</p>
          <p><span className="font-semibold text-navy">Telefon:</span> {o.customer_phone}</p>
          {o.customer_email && <p><span className="font-semibold text-navy">Email:</span> {o.customer_email}</p>}
          <p><span className="font-semibold text-navy">Adresă:</span> {o.customer_address}</p>
          {o.notes && <p><span className="font-semibold text-navy">Observații:</span> {o.notes}</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-kraft shadow-sm">
        <p className="px-5 py-3 font-display font-bold text-navy">Produse comandate</p>
        {((items as OrderItem[]) ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="font-semibold text-navy">{item.product_name}</p>
              <p className="text-sm text-navy/60">
                {item.quantity} × {item.unit_price.toFixed(2)} lei
              </p>
            </div>
            <p className="font-display font-bold text-coral">{item.subtotal.toFixed(2)} lei</p>
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-4 bg-kraft/20">
          <span className="font-display font-bold text-navy">Total comandă</span>
          <span className="font-display font-bold text-lg text-coral">{o.total.toFixed(2)} lei</span>
        </div>
      </div>
    </div>
  );
}
