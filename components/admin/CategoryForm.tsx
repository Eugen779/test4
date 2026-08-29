"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import ImageUploader from "./ImageUploader";
import type { Category } from "@/lib/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoryForm({ initial }: { initial?: Category }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order?.toString() ?? "0");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const payload = {
      name,
      slug: slugify(name),
      image_url: imageUrl,
      display_order: parseInt(displayOrder || "0", 10),
      is_active: isActive,
    };
    const { error } = initial
      ? await supabase.from("categories").update(payload).eq("id", initial.id)
      : await supabase.from("categories").insert(payload);
    setSaving(false);
    if (error) {
      setError("Salvarea a eșuat: " + error.message);
      return;
    }
    router.push("/admin/categorii");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial || !confirm("Ștergi această categorie? Produsele rămân, dar necategorizate.")) return;
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", initial.id);
    router.push("/admin/categorii");
    router.refresh();
  }

  return (
    <div className="max-w-md bg-white rounded-2xl p-5 space-y-4 shadow-sm">
      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Nume categorie</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          placeholder="ex. Icre & Caviar"
        />
      </div>

      <ImageUploader value={imageUrl} onChange={setImageUrl} label="Imagine categorie (afișată rotund)" />

      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Ordine afișare</label>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
          className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-navy">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Vizibilă în magazin
      </label>

      {error && <p className="text-coral text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !name}
          className="bg-coral hover:bg-coralDark text-cream font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
        >
          {saving ? "Se salvează..." : "Salvează categoria"}
        </button>
        {initial && (
          <button onClick={handleDelete} className="text-coral text-sm font-medium">
            Șterge categoria
          </button>
        )}
      </div>
    </div>
  );
}
