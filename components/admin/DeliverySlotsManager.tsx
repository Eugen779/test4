"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import type { DeliverySlot } from "@/lib/types";

const DAY_NAMES = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];

export default function DeliverySlotsManager({ slots }: { slots: DeliverySlot[] }) {
  const router = useRouter();
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:30");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("delivery_slots").insert({
      day_of_week: parseInt(dayOfWeek, 10),
      start_time: startTime,
      end_time: endTime,
      is_active: true,
    });
    setSaving(false);
    if (error) {
      setError("Adăugarea a eșuat: " + error.message);
      return;
    }
    router.refresh();
  }

  async function toggleActive(slot: DeliverySlot) {
    const supabase = createClient();
    await supabase.from("delivery_slots").update({ is_active: !slot.is_active }).eq("id", slot.id);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Ștergi acest interval?")) return;
    const supabase = createClient();
    await supabase.from("delivery_slots").delete().eq("id", id);
    router.refresh();
  }

  const grouped = DAY_NAMES.map((name, idx) => ({
    name,
    idx,
    slots: slots.filter((s) => s.day_of_week === idx),
  }));

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-display font-bold text-lg text-navy mb-3">Adaugă interval nou</h2>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="border border-kraftDark rounded-lg px-3 py-2 bg-white focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          >
            {DAY_NAMES.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border border-kraftDark rounded-lg px-3 py-2 focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
          />
        </div>
        {error && <p className="text-coral text-sm mb-2">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={saving}
          className="bg-coral hover:bg-coralDark text-cream font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {saving ? "Se adaugă..." : "+ Adaugă interval"}
        </button>
      </div>

      {grouped.map((day) => (
        <div key={day.idx} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <p className="px-5 py-3 font-display font-bold text-navy border-b border-kraft">{day.name}</p>
          {day.slots.length === 0 ? (
            <p className="px-5 py-4 text-sm text-navy/40">Fără livrare în această zi.</p>
          ) : (
            <div className="divide-y divide-kraft">
              {day.slots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between px-5 py-3">
                  <span className={`font-semibold ${slot.is_active ? "text-navy" : "text-navy/30 line-through"}`}>
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleActive(slot)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        slot.is_active ? "bg-seafoam/20 text-seafoam" : "bg-navy/10 text-navy/50"
                      }`}
                    >
                      {slot.is_active ? "Activ" : "Oprit"}
                    </button>
                    <button onClick={() => handleDelete(slot.id)} aria-label="Șterge intervalul" className="text-coral">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
