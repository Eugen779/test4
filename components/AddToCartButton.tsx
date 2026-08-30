"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

function formatWeight(grams: number) {
  return grams >= 1000 ? `${(grams / 1000).toString().replace(".", ",")}kg` : `${grams}g`;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const hasWeightOptions = product.unit === "kg" && (product.weight_options?.length ?? 0) > 0;
  const [selectedWeight, setSelectedWeight] = useState<number | null>(
    hasWeightOptions ? product.weight_options![0] : null
  );

  // Pentru produsele la kg cu greutate aleasă, prețul se calculează
  // proporțional din prețul per kilogram (ex. 700g = 70% din preț).
  const effectivePrice =
    hasWeightOptions && selectedWeight ? Math.round(product.price * (selectedWeight / 1000) * 100) / 100 : product.price;
  const effectiveName =
    hasWeightOptions && selectedWeight ? `${product.name} (${formatWeight(selectedWeight)})` : product.name;

  function handleAdd() {
    addItem(
      {
        id: hasWeightOptions && selectedWeight ? `${product.id}-${selectedWeight}` : product.id,
        name: effectiveName,
        price: effectivePrice,
        image: product.images[0] ?? null,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-3">
      {hasWeightOptions && (
        <div>
          <p className="text-sm font-semibold text-navy mb-2">Alege greutatea</p>
          <div className="flex gap-2">
            {product.weight_options!.map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWeight(w)}
                className={`flex-1 py-2.5 rounded-lg border font-semibold text-sm ${
                  selectedWeight === w
                    ? "bg-coral text-cream border-coral"
                    : "border-kraftDark text-navy hover:bg-kraft/30"
                }`}
              >
                {formatWeight(w)}
              </button>
            ))}
          </div>
          <p className="text-navy/60 text-sm mt-2">
            Preț pentru {formatWeight(selectedWeight ?? 0)}:{" "}
            <span className="font-bold text-coral">{effectivePrice.toFixed(2)} lei</span>
          </p>
        </div>
      )}

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
        <span className="text-navy/60 text-sm">{hasWeightOptions ? "pachet" : product.unit}</span>
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
