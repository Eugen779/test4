"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import ImageUploader from "./ImageUploader";
import type { Banner } from "@/lib/types";

export default function BannerForm({ initial }: { initial?: Banner }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [buttonText, setButtonText] = useState(initial?.button_text ?? "Vezi produse");
  const [buttonLink, setButtonLink] = useState(initial?.button_link ?? "/produse");
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order?.toString() ?? "0");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!imageUrl) {
      setError("Adaugă o imagine pentru banner.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const payload = {
      title: title || null,
      subtitle: subtitle || null,
      image_url: imageUrl,
      button_text: buttonText,
      button_link: buttonLink,
      display_order: parseInt(displayOrder || "0", 10),
      is_active: isActive,
    };
    const { error } = initial
      ? await supabase.from("banners").update(payload).eq("id", initial.id)
      : await supabase.from("banners").insert(payload);
    setSaving(false);
    if (error) {
      setError("Salvarea a eșuat: " + error.message);
      return;
    }
    router.push("/admin/bannere");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial || !confirm("Ștergi acest banner?")) return;
    const supabase = createClient();
    await supabase.from("banners").delete().eq("id", initial.id);
    router.push("/admin/bannere");
    router.refresh();
  }

  return (
    <div className="max-w-md bg-white rounded-2xl p-5 space-y-4 shadow-sm">
      <ImageUploader value={imageUrl} onChange={setImageUrl} label="Imagine banner (afișată pe toată lățimea)" />

      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Titlu (opțional)</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none" placeholder="ex. Icre premium" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Subtitlu (opțional)</label>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none" placeholder="ex. Calitate superioară direct din ocean" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Text buton</label>
          <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Link buton</label>
          <input value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Ordine în slider</label>
        <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none" />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-navy">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Activ pe homepage
      </label>

      {error && <p className="text-coral text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="bg-coral hover:bg-coralDark text-cream font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm">
          {saving ? "Se salvează..." : "Salvează bannerul"}
        </button>
        {initial && (
          <button onClick={handleDelete} className="text-coral text-sm font-medium">
            Șterge bannerul
          </button>
        )}
      </div>
    </div>
  );
}
