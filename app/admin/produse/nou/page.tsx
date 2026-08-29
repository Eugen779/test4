import { createClient } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/lib/types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-5">Produs nou</h1>
      <ProductForm categories={(categories as Category[]) ?? []} />
    </div>
  );
}
