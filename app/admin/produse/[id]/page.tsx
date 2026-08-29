import { createClient } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category, Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("products").select("*").eq("id", id).single(),
  ]);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-5">Editează produs</h1>
      <ProductForm categories={(categories as Category[]) ?? []} initial={product as Product} />
    </div>
  );
}
