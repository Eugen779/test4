"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useCart } from "@/lib/cart-context";
import { createClient } from "@/lib/supabase-client";
import type { DeliverySlot } from "@/lib/types";

function generateOrderNumber() {
  const now = new Date();
  const stamp = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `OP-${stamp}-${rand}`;
}

const DELIVERY_FEE = 40;
const DAY_NAMES = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];

type SlotOption = { key: string; label: string };

// Calculează primele opțiuni de livrare disponibile, pornind de la ora curentă —
// sare peste intervalele din ziua de azi care deja au trecut.
function computeSlotOptions(slots: DeliverySlot[], now: Date): SlotOption[] {
  const options: SlotOption[] = [];
  for (let offset = 0; offset < 8 && options.length < 8; offset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    const dow = date.getDay();
    const daySlots = slots
      .filter((s) => s.day_of_week === dow)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    for (const slot of daySlots) {
      const [eh, em] = slot.end_time.split(":").map(Number);
      const slotEnd = new Date(date);
      slotEnd.setHours(eh, em, 0, 0);
      if (offset === 0 && slotEnd <= now) continue; // interval deja trecut azi

      const dayLabel = offset === 0 ? "Azi" : offset === 1 ? "Mâine" : DAY_NAMES[dow];
      const dateLabel = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const label = `${dayLabel}, ${dateLabel} · ${slot.start_time.slice(0, 5)}–${slot.end_time.slice(0, 5)}`;
      options.push({ key: `${offset}-${slot.id}`, label });
    }
  }
  return options;
}

export default function CheckoutClient({
  minOrderEnabled,
  minOrderAmount,
  deliverySlots,
}: {
  minOrderEnabled: boolean;
  minOrderAmount: number;
  deliverySlots: DeliverySlot[];
}) {
  const { items, total, clear } = useCart();
  const router = useRouter();

  const slotOptions = useMemo(() => computeSlotOptions(deliverySlots, new Date()), [deliverySlots]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(slotOptions[0]?.label ?? null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grandTotal = total + DELIVERY_FEE;
  const belowMinimum = minOrderEnabled && total < minOrderAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || belowMinimum) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const orderNumber = generateOrderNumber();
    const orderId = crypto.randomUUID();

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      order_number: orderNumber,
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      customer_address: address,
      notes: notes || null,
      total: grandTotal,
      status: "noua",
      delivery_slot: selectedSlot,
    });

    if (orderError) {
      setError(`Comanda nu a putut fi trimisă: ${orderError.message}`);
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    setSubmitting(false);
    if (itemsError) {
      setError(`Comanda a fost creată, dar a apărut o eroare la produse: ${itemsError.message}`);
      return;
    }

    clear();
    router.push(`/checkout/confirmare?numar=${orderNumber}`);
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-cream">
        <Header />
        <p className="text-center text-navy/50 py-16">Coșul tău este gol.</p>
      </main>
    );
  }

  if (belowMinimum) {
    return (
      <main className="min-h-screen bg-cream">
        <Header />
        <div className="px-4 pt-16 pb-16 text-center max-w-sm mx-auto">
          <p className="text-navy/70 mb-4">
            Comanda minimă este de <span className="font-bold text-coral">{minOrderAmount.toFixed(2)} lei</span>.
            Coșul tău are momentan {total.toFixed(2)} lei.
          </p>
          <Link href="/cos" className="inline-block bg-coral text-cream font-display font-bold px-8 py-3 rounded-badge">
            Înapoi la coș
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-5 max-w-md mx-auto">
        <h1 className="font-display font-bold text-2xl text-navy mb-4">Finalizează comanda</h1>

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
            <span>Livrare (Chișinău și suburbii)</span>
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

        {slotOptions.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-semibold text-navy mb-2">Când vrei să primești comanda?</p>
            <div className="space-y-2">
              {slotOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedSlot(opt.label)}
                  className={`w-full text-left px-4 py-3 rounded-lg border font-medium text-sm ${
                    selectedSlot === opt.label
                      ? "bg-coral text-cream border-coral"
                      : "bg-white border-kraftDark text-navy hover:bg-kraft/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

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
            <label className="block text-sm font-semibold text-navy mb-1">Email (opțional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Adresă de livrare</label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-kraftDark rounded-lg px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Observații (opțional)</label>
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
