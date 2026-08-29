import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-5">
        <h1 className="font-display font-bold text-2xl text-navy mb-4">Toate produsele</h1>
        <div className="grid grid-cols-2 gap-4">
          {((products as Product[]) ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {(!products || products.length === 0) && (
          <p className="text-center text-navy/50 py-10">Momentan nu există produse disponibile.</p>
        )}
      </div>
    </main>
  );
}
