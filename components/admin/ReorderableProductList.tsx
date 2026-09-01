"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import type { Product } from "@/lib/types";

export default function ReorderableProductList({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
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
      supabase.from("products").update({ display_order: index }).eq("id", next[index].id),
      supabase.from("products").update({ display_order: targetIndex }).eq("id", next[targetIndex].id),
    ]);

    setMoving(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden divide-y divide-kraft shadow-sm">
      {items.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-kraft/30 transition-colors">
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

          <Link href={`/admin/produse/${p.id}`} className="flex items-center gap-4 flex-1 min-w-0">
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
              className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                p.is_active ? "bg-seafoam/20 text-seafoam" : "bg-navy/10 text-navy/50"
              }`}
            >
              {p.is_active ? "Activ" : "Ascuns"}
            </span>
          </Link>
        </div>
      ))}
      {items.length === 0 && <p className="p-6 text-center text-navy/50">Niciun produs încă. Adaugă primul!</p>}
    </div>
  );
}
