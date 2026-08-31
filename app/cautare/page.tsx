import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { PUBLIC_PRODUCT_COLUMNS } from "@/lib/product-columns";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const supabase = await createClient();

  const { data: products } = query
    ? await supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("is_active", true)
        .ilike("name", `%${query}%`)
        .order("display_order")
    : { data: [] };

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-3">
        <SearchBar />
      </div>
      <div className="px-4 pb-5">
        <h1 className="font-display font-bold text-xl text-navy mb-4">
          {query ? `Rezultate pentru „${query}"` : "Caută produse"}
        </h1>
        <div className="grid grid-cols-2 gap-4">
          {((products as Product[]) ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {query && (!products || products.length === 0) && (
          <p className="text-center text-navy/50 py-10">Niciun produs găsit pentru „{query}".</p>
        )}
      </div>
    </main>
  );
}
