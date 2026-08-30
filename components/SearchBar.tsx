"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/cautare?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-full shadow-md flex items-center gap-3 px-5 py-4">
      <button type="submit" aria-label="Caută">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8342E" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
      </button>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Caută pește, fructe de mare..."
        className="bg-transparent flex-1 outline-none text-navy placeholder:text-navy/40 font-body"
      />
    </form>
  );
}
