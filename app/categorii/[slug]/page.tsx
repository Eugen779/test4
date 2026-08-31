import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { PUBLIC_PRODUCT_COLUMNS } from "@/lib/product-columns";
import type { Category, Product } from "@/lib/types";

export const revalidate = 30; // date reîmprospătate din admin cel mult la 30 secunde — mult mai rapid la navigare

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  const { data: products } = category
    ? await supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("category_id", (category as Category).id)
        .eq("is_active", true)
        .order("display_order")
    : { data: [] };

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-5">
        <h1 className="font-display font-bold text-2xl text-navy mb-4">
          {category ? (category as Category).name : "Categorie"}
        </h1>
        <div className="grid grid-cols-2 gap-4">
          {((products as Product[]) ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {(!products || products.length === 0) && (
          <p className="text-center text-navy/50 py-10">Niciun produs în această categorie momentan.</p>
        )}
      </div>
    </main>
  );
}
