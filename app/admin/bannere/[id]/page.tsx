import { createClient } from "@/lib/supabase-server";
import BannerForm from "@/components/admin/BannerForm";
import type { Banner } from "@/lib/types";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: banner } = await supabase.from("banners").select("*").eq("id", id).single();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-navy mb-5">Editează banner</h1>
      <BannerForm initial={banner as Banner} />
    </div>
  );
}
