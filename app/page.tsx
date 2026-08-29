import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import type { Banner, Category, Product } from "@/lib/types";

export const revalidate = 0; // mereu date proaspete din admin

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: banners }, { data: categories }, { data: featured }] = await Promise.all([
    supabase.from("banners").select("*").eq("is_active", true).order("display_order"),
    supabase.from("categories").select("*").eq("is_active", true).order("display_order"),
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("display_order")
      .limit(8),
  ]);

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <HeroSlider banners={(banners as Banner[]) ?? []} />

      {/* Căutare */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-full shadow-md flex items-center gap-3 px-5 py-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8342E" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Caută pește, fructe de mare..."
            className="bg-transparent flex-1 outline-none text-navy placeholder:text-navy/40 font-body"
          />
        </div>
      </div>

      <CategoryGrid categories={(categories as Category[]) ?? []} />

      {featured && featured.length > 0 && (
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-navy">Raft Avantajos</h2>
            <a href="/produse" className="text-coral font-semibold text-sm">
              Vezi toate →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(featured as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
