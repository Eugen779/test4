import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import type { Banner } from "@/lib/types";

export const revalidate = 0;

export default async function AdminBannersPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase.from("banners").select("*").order("display_order");

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-2xl text-navy">Bannere & Homepage</h1>
        <Link href="/admin/bannere/nou" className="bg-coral hover:bg-coralDark text-cream font-semibold text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md">
          + Banner nou
        </Link>
      </div>
      <p className="text-navy/60 text-sm mb-4">
        Aceste bannere apar în slider-ul din capul paginii principale, în ordinea de mai jos.
      </p>

      <div className="space-y-3">
        {((banners as Banner[]) ?? []).map((b) => (
          <Link key={b.id} href={`/admin/bannere/${b.id}`} className="flex items-center gap-4 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all">
            <div className="w-24 h-16 rounded-lg bg-kraft overflow-hidden shrink-0">
              <Image src={b.image_url} alt="" width={96} height={64} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy truncate">{b.title || "(fără titlu)"}</p>
              <p className="text-sm text-navy/60 truncate">{b.subtitle}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${b.is_active ? "bg-seafoam/20 text-seafoam" : "bg-navy/10 text-navy/50"}`}>
              {b.is_active ? "Activ" : "Ascuns"}
            </span>
          </Link>
        ))}
        {(!banners || banners.length === 0) && (
          <p className="p-6 text-center text-navy/50 bg-white rounded-2xl shadow-sm">Niciun banner încă.</p>
        )}
      </div>
    </div>
  );
}
