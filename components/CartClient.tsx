"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useCart } from "@/lib/cart-context";

export default function CartClient({
  minOrderEnabled,
  minOrderAmount,
}: {
  minOrderEnabled: boolean;
  minOrderAmount: number;
}) {
  const { items, updateQuantity, removeItem, total } = useCart();

  const belowMinimum = minOrderEnabled && total < minOrderAmount;
  const progressPct = minOrderEnabled ? Math.min(100, (total / minOrderAmount) * 100) : 100;
  const remaining = minOrderAmount - total;

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-5">
        <h1 className="font-display font-bold text-2xl text-navy mb-4">Coșul tău</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-navy/50 mb-4">Coșul tău este gol.</p>
            <Link href="/produse" className="text-coral font-semibold">
              Vezi produsele →
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                  <div className="w-16 h-16 rounded-lg bg-kraft overflow-hidden shrink-0">
                    {item.image && (
                      <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy truncate">{item.name}</p>
                    <p className="text-coral font-bold">{item.price.toFixed(2)} lei</p>
                  </div>
                  <div className="flex items-center border border-kraftDark rounded-full overflow-hidden shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-navy font-bold"
                      aria-label="Scade cantitatea"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-navy font-bold"
                      aria-label="Crește cantitatea"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Elimină produsul"
                    className="text-coral text-sm shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-white rounded-xl p-4 flex items-center justify-between">
              <span className="font-display font-bold text-lg text-navy">Subtotal</span>
              <span className="font-display font-bold text-xl text-coral">{total.toFixed(2)} lei</span>
            </div>
            <p className="text-xs text-navy/50 text-center mt-2">
              + livrare 40 lei (Chișinău și suburbii), plată cash — se calculează la finalizare
            </p>

            {/* Bară de progres pentru comanda minimă — apare doar dacă e activată din admin */}
            {minOrderEnabled && (
              <div className="mt-4 bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-navy">
                    {belowMinimum ? "Comandă minimă" : "Poți finaliza comanda! ✓"}
                  </span>
                  <span className="text-sm font-bold text-coral">
                    {total.toFixed(2)} / {minOrderAmount.toFixed(2)} lei
                  </span>
                </div>
                <div className="h-2.5 bg-kraft rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      belowMinimum ? "bg-coral" : "bg-seafoam"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {belowMinimum && (
                  <p className="text-xs text-navy/60 mt-2">
                    Mai adaugă <span className="font-semibold text-coral">{remaining.toFixed(2)} lei</span> pentru a
                    comanda.
                  </p>
                )}
              </div>
            )}

            {belowMinimum ? (
              <button
                disabled
                className="block w-full text-center mt-4 bg-kraftDark text-navy/50 font-display font-bold py-4 rounded-badge cursor-not-allowed"
              >
                Finalizează comanda
              </button>
            ) : (
              <Link
                href="/checkout"
                className="block text-center mt-4 bg-coral hover:bg-coralDark transition-colors text-cream font-display font-bold py-4 rounded-badge"
              >
                Finalizează comanda
              </Link>
            )}
          </>
        )}
      </div>
    </main>
  );
}
