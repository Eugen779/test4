"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";

// Componentă de upload: alegi o poză de pe telefon/calculator,
// se urcă direct în Supabase Storage (bucket "images") și primești URL-ul public.
export default function ImageUploader({
  value,
  onChange,
  label = "Imagine",
}: {
  value: string | null;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("images").upload(path, file);
    if (uploadError) {
      setError("Încărcarea a eșuat. Încearcă din nou.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">{label}</label>
      {value && (
        <div className="w-32 h-32 rounded-lg overflow-hidden mb-2 bg-kraft">
          <Image src={value} alt="" width={128} height={128} className="object-cover w-full h-full" />
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="text-sm" />
      {uploading && <p className="text-sm text-navy/60 mt-1">Se încarcă...</p>}
      {error && <p className="text-sm text-coral mt-1">{error}</p>}
    </div>
  );
}
