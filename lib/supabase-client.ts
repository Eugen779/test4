import { createBrowserClient } from "@supabase/ssr";

// Client Supabase pentru componente care rulează în browser
// (ex: pagini admin cu formulare, upload imagini).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
