import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import ReorderableProductList from "@/components/admin/ReorderableProductList";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("display_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-2xl text-navy">Produse</h1>
        <Link
          href="/admin/produse/nou"
          className="bg-coral hover:bg-coralDark text-cream font-semibold text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
        >
          + Produs nou
        </Link>
      </div>
      <p className="text-sm text-navy/50 mb-3">Folosește săgețile ca să schimbi ordinea de afișare din magazin.</p>

      <ReorderableProductList products={(products as Product[]) ?? []} />
    </div>
  );
}
