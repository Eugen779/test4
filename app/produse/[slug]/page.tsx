import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) {
    return (
      <main className="min-h-screen bg-cream">
        <Header />
        <p className="text-center text-navy/50 py-16">Produsul nu a fost găsit.</p>
      </main>
    );
  }

  const p = product as Product;
  const discount =
    p.compare_at_price && p.compare_at_price > p.price
      ? Math.round(100 - (p.price / p.compare_at_price) * 100)
      : null;

  return (
    <main className="min-h-screen bg-cream">
      <Header />

      <div className="relative aspect-square bg-kraft">
        {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
        {discount && (
          <span className="absolute top-4 left-4 bg-coral text-cream text-sm font-bold px-3 py-1 rounded-badge">
            -{discount}%
          </span>
        )}
      </div>

      <div className="p-5">
        <h1 className="font-display font-bold text-2xl text-navy">{p.name}</h1>

        {(p.size || p.weight_note) && (
          <div className="flex items-center gap-2 mt-1.5">
            {p.size && (
              <span className="text-xs font-semibold text-navy bg-kraft px-2.5 py-1 rounded-full">{p.size}</span>
            )}
            {p.weight_note && <span className="text-sm text-navy/60">{p.weight_note}</span>}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2 mb-4">
          <span className="font-display font-bold text-2xl text-coral">
            {p.price.toFixed(2)} lei
            <span className="text-sm font-body font-normal text-navy/50"> / {p.unit === "kg" ? "kg" : "buc"}</span>
          </span>
          {p.compare_at_price && (
            <span className="text-navy/50 line-through">{p.compare_at_price.toFixed(2)} lei</span>
          )}
        </div>

        {p.description && <p className="text-navy/70 leading-relaxed mb-6">{p.description}</p>}

        <AddToCartButton product={p} />
      </div>
    </main>
  );
}
