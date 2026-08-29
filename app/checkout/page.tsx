"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase-client";

function generateOrderNumber() {
  const now = new Date();
  const stamp = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OP-${stamp}-${rand}`;
}

const DELIVERY_FEE = 40;

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grandTotal = total + DELIVERY_FEE;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const orderNumber = generateOrderNumber();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        customer_address: address,
        notes: notes || null,
        total: grandTotal,
        status: "noua",
      })
      .select()
      .single();

    if (orderError || !order) {
      setError(`Comanda nu a putut fi trimisÄƒ: ${orderError?.message ?? "eroare necunoscutÄƒ"}`);
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    setSubmitting(false);
    if (itemsError) {
      setError(`Comanda a fost creatÄƒ, dar a apÄƒrut o eroare la produse: ${itemsError.message}`);
      return;
    }

    clear();
    router.push(`/checkout/confirmare?numar=${orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-cream">
        <Header />
        <p className="text-center text-navy/50 py-16">CoÈ™ul tÄƒu este gol.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-5 max-w-md mx-auto">
        <h1 className="font-display font-bold text-2xl text-navy mb-4">FinalizeazÄƒ comanda</h1>

        <div className="bg-white rounded-xl p-4 mb-5">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span className="text-navy/80">
                {item.quantity} × {item.name}
              </span>
              <span className="font-semibold text-navy">{(item.price * item.quantity).toFixed(2)} lei</span>
            </div>
          ))}
          <div className="flex justify-between text-sm py-1 text-navy/80">
            <span>Livrare (ChiÈ™inÄƒu È™i suburbii)</span>
            <span className="font-semibold text-navy">{DELIVERY_FEE.toFixed(2)} lei</span>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-kraft font-display font-bold text-navy">
            <span>Total</span>
            <span className="text-coral">{grandTotal.toFixed(2)} lei</span>
          </div>
        </div>

        <div className="bg-seafoam/10 border border-seafoam/30 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7FA69A" strokeWidth="2" className="shrink-0">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M2 10h20" />
          </svg>
          <p className="text-sm text-navy/80">
            Plata se face <span className="font-semibold">doar cash, la livrare</span> (ramburs).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Nume complet</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Telefon</label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Email (opÈ›ional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">AdresÄƒ de livrare</label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">ObservaÈ›ii (opÈ›ional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white"
            />
          </div>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-coral hover:bg-coralDark disabled:opacity-60 transition-colors text-cream font-display font-bold py-4 rounded-badge"
          >
            {submitting ? "Se trimite..." : "Trimite comanda"}
          </button>
        </form>
      </div>
    </main>
  );
}
