import { createClient } from "@/lib/supabase-server";
import CategoryForm from "@/components/admin/CategoryForm";
import type { Category } from "@/lib/types";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase.from("categories").select("*").eq("id", id).single();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-5">Editează categorie</h1>
      <CategoryForm initial={category as Category} />
    </div>
  );
}
