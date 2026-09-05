"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";
import { createClient } from "@/lib/supabase-client";

export default function LocationBroadcaster({ orderId }: { orderId: string }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);
  const lastSent = useRef(0);

  function start() {
    if (!("geolocation" in navigator)) {
      setError("Telefonul/browserul nu suportă locația.");
      return;
    }
    setError(null);
    setActive(true);

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        // Trimitem cel mult o dată la 5 secunde, chiar dacă senzorul GPS
        // raportează schimbări mai des.
        if (now - lastSent.current < 5000) return;
        lastSent.current = now;

        const supabase = createClient();
        await supabase
          .from("orders")
          .update({
            current_lat: position.coords.latitude,
            current_lng: position.coords.longitude,
            location_updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      },
      () => setError("Nu am putut accesa locația — verifică permisiunile."),
      { enableHighAccuracy: true, maximumAge: 4000 }
    );
  }

  function stop() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setActive(false);
  }

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Navigation size={18} className="text-coral" />
        <h2 className="font-display font-bold text-navy">Locație live pentru client</h2>
      </div>
      <p className="text-sm text-navy/60 mb-3">
        Clientul vede pe hartă locația ta, actualizată automat, cât timp ții pornită transmiterea.
      </p>
      {error && <p className="text-coral text-sm mb-2">{error}</p>}
      <button
        onClick={active ? stop : start}
        className={`font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md ${
          active ? "bg-navy text-cream" : "bg-coral text-cream hover:bg-coralDark"
        }`}
      >
        {active ? "Oprește transmiterea locației" : "Pornește transmiterea locației"}
      </button>
      {active && <p className="text-xs text-seafoam font-semibold mt-2">● Transmite live...</p>}
    </div>
  );
}
