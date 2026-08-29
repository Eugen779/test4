"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email sau parolă greșită.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-cream rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h1 className="font-display font-bold text-2xl text-navy mb-1">Ocean Produs</h1>
        <p className="text-navy/60 text-sm mb-6">Autentificare admin</p>

        <label className="block text-sm font-semibold text-navy mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-kraftDark rounded-lg px-3 py-2 mb-4 bg-white focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
        />

        <label className="block text-sm font-semibold text-navy mb-1">Parolă</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-kraftDark rounded-lg px-3 py-2 mb-4 bg-white focus:border-coral focus:ring-2 focus:ring-coral/20 outline-none"
        />

        {error && <p className="text-coral text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coral hover:bg-coralDark text-cream font-display font-bold py-3 rounded-lg shadow-sm hover:shadow-md disabled:opacity-60 disabled:hover:shadow-sm"
        >
          {loading ? "Se conectează..." : "Conectează-te"}
        </button>
      </form>
    </div>
  );
}
