"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function handleAdd() {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? null,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-kraftDark rounded-full overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-navy font-bold"
            aria-label="Scade cantitatea"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 flex items-center justify-center text-navy font-bold"
            aria-label="Crește cantitatea"
          >
            +
          </button>
        </div>
        <span className="text-navy/60 text-sm">{product.unit}</span>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock <= 0}
        className="w-full bg-coral hover:bg-coralDark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-cream font-display font-bold py-3.5 rounded-badge"
      >
        {product.stock <= 0 ? "Stoc epuizat" : added ? "Adăugat! ✓" : "Adaugă în coș"}
      </button>

      <button
        onClick={() => router.push("/cos")}
        className="w-full text-coral font-semibold text-sm py-1"
      >
        Vezi coșul
      </button>
    </div>
  );
}
