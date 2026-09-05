"use client";

import { useState, useEffect, useRef } from "react";

type Suggestion = { display_name: string; lat: number; lon: number };

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  confirmed,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: Suggestion) => void;
  confirmed: boolean;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (confirmed || value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
      setLoading(false);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, confirmed]);

  return (
    <div className="relative">
      <textarea
        required
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Scrie strada și numărul (livrăm doar în Chișinău și suburbii)"
        className={`w-full border rounded-lg px-3 py-2.5 bg-white ${
          confirmed ? "border-seafoam" : "border-kraftDark"
        }`}
      />
      {confirmed && <p className="text-xs text-seafoam font-semibold mt-1">✓ Adresă confirmată</p>}
      {!confirmed && loading && <p className="text-xs text-navy/40 mt-1">Se caută...</p>}
      {!confirmed && !loading && value.trim().length >= 3 && suggestions.length === 0 && (
        <p className="text-xs text-coral mt-1">Nicio adresă găsită în Chișinău sau suburbii pentru acest text.</p>
      )}

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-kraftDark rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(s);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-navy hover:bg-kraft/30 border-b border-kraft last:border-0"
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
