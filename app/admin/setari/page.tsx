import { createClient } from "@/lib/supabase-server";
import SettingsForm from "@/components/admin/SettingsForm";
import type { Settings } from "@/lib/types";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).single();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-5">Setări</h1>
      <SettingsForm initial={settings as Settings} />
    </div>
  );
}
