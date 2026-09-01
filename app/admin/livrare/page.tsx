import { createClient } from "@/lib/supabase-server";
import DeliverySlotsManager from "@/components/admin/DeliverySlotsManager";
import type { DeliverySlot } from "@/lib/types";

export const revalidate = 0;

export default async function AdminDeliveryPage() {
  const supabase = await createClient();
  const { data: slots } = await supabase
    .from("delivery_slots")
    .select("*")
    .order("day_of_week")
    .order("start_time");

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-2">Intervale de livrare</h1>
      <p className="text-sm text-navy/50 mb-5">
        Clienții aleg unul dintre aceste intervale la finalizarea comenzii. „Oprit" sau ștergerea unui interval îl
        elimină din opțiuni — o zi fără niciun interval activ înseamnă că nu livrezi în acea zi.
      </p>
      <DeliverySlotsManager slots={(slots as DeliverySlot[]) ?? []} />
    </div>
  );
}
