import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
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

      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-kraft shadow-sm">
        {((products as Product[]) ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/produse/${p.id}`}
            className="flex items-center gap-4 p-3 hover:bg-kraft/30 transition-colors"
          >
            <div className="w-14 h-14 rounded-lg bg-kraft overflow-hidden shrink-0">
              {p.images[0] && (
                <Image src={p.images[0]} alt="" width={56} height={56} className="object-cover w-full h-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy truncate">{p.name}</p>
              <p className="text-sm text-navy/60">
                {p.price.toFixed(2)} lei · stoc {p.stock}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                p.is_active ? "bg-seafoam/20 text-seafoam" : "bg-navy/10 text-navy/50"
              }`}
            >
              {p.is_active ? "Activ" : "Ascuns"}
            </span>
          </Link>
        ))}
        {(!products || products.length === 0) && (
          <p className="p-6 text-center text-navy/50">Niciun produs încă. Adaugă primul!</p>
        )}
      </div>
    </div>
  );
}
