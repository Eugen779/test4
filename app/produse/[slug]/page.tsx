import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCarouselCard from "@/components/ProductCarouselCard";
import { PUBLIC_PRODUCT_COLUMNS } from "@/lib/product-columns";
import type { Product } from "@/lib/types";

export const revalidate = 30; // date reîmprospătate din admin cel mult la 30 secunde — mult mai rapid la navigare

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Produsul și un set de produse candidate pentru recomandări se cer
  // simultan (nu unul după altul) — reduce timpul de așteptare la jumătate.
  const [{ data: product }, { data: pool }] = await Promise.all([
    supabase.from("products").select(PUBLIC_PRODUCT_COLUMNS).eq("slug", slug).single(),
    supabase.from("products").select(PUBLIC_PRODUCT_COLUMNS).eq("is_active", true).order("display_order").limit(20),
  ]);

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

  // Produse recomandate — prioritizăm aceeași categorie, completăm cu altele dacă nu sunt destule.
  const candidates = ((pool as Product[]) ?? []).filter((x) => x.id !== p.id);
  let related = candidates.filter((x) => x.category_id === p.category_id).slice(0, 5);
  if (related.length < 5) {
    const usedIds = new Set(related.map((r) => r.id));
    const fillers = candidates.filter((x) => !usedIds.has(x.id)).slice(0, 5 - related.length);
    related = [...related, ...fillers];
  }

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

      {related.length > 0 && (
        <section className="px-4 pb-8 pt-2">
          <h2 className="font-display font-bold text-lg text-navy mb-3">S-ar putea să-ți placă și</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {related.map((rp) => (
              <ProductCarouselCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
