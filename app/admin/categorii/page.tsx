import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
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

      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-kraft shadow-sm">
        {((categories as Category[]) ?? []).map((c) => (
          <Link key={c.id} href={`/admin/categorii/${c.id}`} className="flex items-center gap-4 p-3 hover:bg-kraft/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-kraft overflow-hidden shrink-0">
              {c.image_url && <Image src={c.image_url} alt="" width={48} height={48} className="object-cover w-full h-full" />}
            </div>
            <p className="font-semibold text-navy flex-1">{c.name}</p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.is_active ? "bg-seafoam/20 text-seafoam" : "bg-navy/10 text-navy/50"}`}>
              {c.is_active ? "Activă" : "Ascunsă"}
            </span>
          </Link>
        ))}
        {(!categories || categories.length === 0) && (
          <p className="p-6 text-center text-navy/50">Nicio categorie încă.</p>
        )}
      </div>
    </div>
  );
}
