"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import type { OrderStatus } from "@/lib/types";

const options: { value: OrderStatus; label: string }[] = [
  { value: "noua", label: "Nouă" },
  { value: "confirmata", label: "Confirmată" },
  { value: "in_livrare", label: "În livrare" },
  { value: "livrata", label: "Livrată" },
  { value: "anulata", label: "Anulată" },
];

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(newStatus: OrderStatus) {
    setValue(newStatus);
    setSaving(true);
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      disabled={saving}
      className="text-sm border border-kraftDark rounded-lg px-3 py-1.5 bg-white"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
