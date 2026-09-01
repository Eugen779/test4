import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import ReorderableCategoryList from "@/components/admin/ReorderableCategoryList";
import type { Category } from "@/lib/types";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-2xl text-navy">Categorii</h1>
        <Link href="/admin/categorii/noua" className="bg-coral hover:bg-coralDark text-cream font-semibold text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md">
          + Categorie nouă
        </Link>
      </div>
      <p className="text-sm text-navy/50 mb-3">Folosește săgețile ca să schimbi ordinea de afișare din magazin.</p>

      <ReorderableCategoryList categories={(categories as Category[]) ?? []} />
    </div>
  );
}
