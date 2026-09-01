"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import type { Settings } from "@/lib/types";

export default function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial.min_order_enabled);
  const [amount, setAmount] = useState(initial.min_order_amount?.toString() ?? "250");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("settings")
      .update({
        min_order_enabled: enabled,
        min_order_amount: parseFloat(amount || "0"),
      })
      .eq("id", 1);

    setSaving(false);
    if (error) {
      setError("Salvarea a eșuat: " + error.message);
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-md bg-white rounded-2xl p-5 space-y-5 shadow-sm">
      <div>
        <h2 className="font-display font-bold text-lg text-navy mb-1">Comandă minimă</h2>
        <p className="text-sm text-navy/60">
          Cere clienților o valoare minimă a coșului înainte să poată finaliza comanda.
        </p>
      </div>

      <label className="flex items-center justify-between cursor-pointer">
        <span className="font-semibold text-navy">Activă</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? "bg-coral" : "bg-kraftDark"}`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </label>

      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Sumă minimă (lei)</label>
        <input
          type="number"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!enabled}
          className="w-full border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none disabled:opacity-50 disabled:bg-kraft/20"
        />
      </div>

      {error && <p className="text-coral text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-coral hover:bg-coralDark text-cream font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50"
      >
        {saving ? "Se salvează..." : saved ? "Salvat! ✓" : "Salvează"}
      </button>
    </div>
  );
}
