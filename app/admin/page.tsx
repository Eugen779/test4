import { Package, ShoppingCart, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 0;

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [{ count: products }, { count: orders }, { count: newOrders }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "noua"),
  ]);

  const stats = [
    { label: "Produse", value: products ?? 0, icon: Package },
    { label: "Comenzi totale", value: orders ?? 0, icon: ShoppingCart },
    { label: "Comenzi noi", value: newOrders ?? 0, icon: Sparkles },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-5">Bun venit!</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <s.icon className="mx-auto mb-2 text-coral" size={22} strokeWidth={2} />
            <p className="font-display font-bold text-3xl text-navy">{s.value}</p>
            <p className="text-sm text-navy/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
