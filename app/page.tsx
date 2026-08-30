import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import SearchBar from "@/components/SearchBar";
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
      <div className="px-4 pt-3 pb-2">
        <SearchBar />
      </div>

      <CategoryGrid categories={(categories as Category[]) ?? []} />

      {featured && featured.length > 0 && (
        <section className="px-4 pt-2 pb-6">
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
