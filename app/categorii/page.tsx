import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import type { Category } from "@/lib/types";

export const revalidate = 30; // date reîmprospătate din admin cel mult la 30 secunde — mult mai rapid la navigare

export default async function AllCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-5">
        <h1 className="font-display font-bold text-2xl text-navy mb-4">Toate categoriile</h1>
        <div className="grid grid-cols-2 gap-4">
          {((categories as Category[]) ?? []).map((cat) => (
            <Link
              key={cat.id}
              href={`/categorii/${cat.slug}`}
              className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-kraft shrink-0">
                {cat.image_url && (
                  <Image src={cat.image_url} alt={cat.name} width={56} height={56} className="object-cover w-full h-full" />
                )}
              </div>
              <span className="font-display font-semibold text-navy">{cat.name}</span>
            </Link>
          ))}
        </div>
        {(!categories || categories.length === 0) && (
          <p className="text-center text-navy/50 py-10">Momentan nu există categorii.</p>
        )}
      </div>
    </main>
  );
}
