"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import type { Category } from "@/lib/types";

export default function ReorderableCategoryList({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState(categories);
  const [moving, setMoving] = useState<string | null>(null);
  const router = useRouter();

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setItems(next);
    setMoving(next[index].id);

    const supabase = createClient();
    await Promise.all([
      supabase.from("categories").update({ display_order: index }).eq("id", next[index].id),
      supabase.from("categories").update({ display_order: targetIndex }).eq("id", next[targetIndex].id),
    ]);

    setMoving(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden divide-y divide-kraft shadow-sm">
      {items.map((c, i) => (
        <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-kraft/30 transition-colors">
          <div className="flex flex-col shrink-0">
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0 || moving !== null}
              aria-label="Mută mai sus"
              className="text-navy/50 hover:text-coral disabled:opacity-20"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1 || moving !== null}
              aria-label="Mută mai jos"
              className="text-navy/50 hover:text-coral disabled:opacity-20"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          <Link href={`/admin/categorii/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-kraft overflow-hidden shrink-0">
              {c.image_url && <Image src={c.image_url} alt="" width={48} height={48} className="object-cover w-full h-full" />}
            </div>
            <p className="font-semibold text-navy flex-1 truncate">{c.name}</p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${c.is_active ? "bg-seafoam/20 text-seafoam" : "bg-navy/10 text-navy/50"}`}>
              {c.is_active ? "Activă" : "Ascunsă"}
            </span>
          </Link>
        </div>
      ))}
      {items.length === 0 && <p className="p-6 text-center text-navy/50">Nicio categorie încă.</p>}
    </div>
  );
}
