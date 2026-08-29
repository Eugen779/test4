"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import ImageUploader from "./ImageUploader";
import type { Category, Product } from "@/lib/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Product;
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [comparePrice, setComparePrice] = useState(initial?.compare_at_price?.toString() ?? "");
  const [stock, setStock] = useState(initial?.stock?.toString() ?? "0");
  const [unit, setUnit] = useState(initial?.unit ?? "buc");
  const [size, setSize] = useState(initial?.size ?? "");
  const [weightNote, setWeightNote] = useState(initial?.weight_note ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? categories[0]?.id ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      name,
      slug: slugify(name),
      description,
      price: parseFloat(price || "0"),
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
      stock: parseInt(stock || "0", 10),
      unit,
      size: size || null,
      weight_note: weightNote || null,
      category_id: categoryId || null,
      images,
      is_active: isActive,
      is_featured: isFeatured,
      updated_at: new Date().toISOString(),
    };

    const { error } = initial
      ? await supabase.from("products").update(payload).eq("id", initial.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (error) {
      setError("Salvarea a eșuat: " + error.message);
      return;
    }
    router.push("/admin/produse");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial || !confirm("Ștergi acest produs definitiv?")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", initial.id);
    router.push("/admin/produse");
    router.refresh();
  }

  return (
    <div className="max-w-xl bg-white rounded-2xl p-5 space-y-4 shadow-sm">
      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Nume produs</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          placeholder="ex. Icre de Manciuria 100g"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Descriere</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Preț (lei)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Preț tăiat (opțional)</label>
          <input
            type="number"
            step="0.01"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Stoc</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Preț per</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border border-kraftDark rounded-lg px-3 py-2 bg-white focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          >
            <option value="buc">Bucată</option>
            <option value="kg">Kilogram</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Mărime pachet (opțional)</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full border border-kraftDark rounded-lg px-3 py-2 bg-white focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          >
            <option value="">— Fără —</option>
            <option value="Pachet">Pachet</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Greutate aproximativă</label>
          <input
            value={weightNote}
            onChange={(e) => setWeightNote(e.target.value)}
            placeholder="ex. 250g"
            className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Categorie</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-navy mb-2">Imagini produs</label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
              <button
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 w-5 h-5 bg-coral text-cream rounded-full text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <ImageUploader
            value={null}
            onChange={(url) => setImages([...images, url])}
            label="Adaugă imagine"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-navy">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Vizibil în magazin
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-navy">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          Pus în evidență (Raft Avantajos)
        </label>
      </div>

      {error && <p className="text-coral text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !name || !price}
          className="bg-coral hover:bg-coralDark text-cream font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
        >
          {saving ? "Se salvează..." : "Salvează produsul"}
        </button>
        {initial && (
          <button onClick={handleDelete} className="text-coral text-sm font-medium">
            Șterge produsul
          </button>
        )}
      </div>
    </div>
  );
}
