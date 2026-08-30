"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const [fav, setFav] = useState(false);
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(100 - (product.price / product.compare_at_price) * 100)
      : null;

  return (
    <Link href={`/produse/${product.slug}`} className="block w-full">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-kraft">
        {product.images[0] && (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        )}
        {discount && (
          <span className="absolute top-3 left-3 bg-coral text-cream text-xs font-bold px-3 py-1 rounded-badge">
            -{discount}%
          </span>
        )}
        <button
          aria-label={fav ? "Elimină de la favorite" : "Adaugă la favorite"}
          onClick={(e) => {
            e.preventDefault();
            setFav(!fav);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/90 flex items-center justify-center"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={fav ? "#C8342E" : "none"}
            stroke="#C8342E"
            strokeWidth="2"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </button>
      </div>
      <div className="mt-2">
        <h3 className="font-display font-semibold text-sm text-navy line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-display font-bold text-coral">
            {product.price.toFixed(2)} lei
            {product.unit === "kg" && <span className="text-xs font-body font-normal text-navy/50">/kg</span>}
          </span>
          {product.compare_at_price && (
            <span className="text-xs text-navy/50 line-through">
              {product.compare_at_price.toFixed(2)} lei
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
