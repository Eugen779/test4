"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";

const CourierRouteMap = dynamic(() => import("@/components/CourierRouteMap"), { ssr: false });

const STORAGE_KEY = "ocean-produs-courier";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_slot: string | null;
  total: number;
};

export default function CourierPage() {
  const [courier, setCourier] = useState<{ name: string; pin: string } | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [available, setAvailable] = useState<OrderRow[]>([]);
  const [mine, setMine] = useState<OrderRow[]>([]);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{ position: number; label: string }[]>([]);
  const [totalMinutes, setTotalMinutes] = useState<number | null>(null);
  const watchId = useRef<number | null>(null);
  const lastSent = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCourier(JSON.parse(raw));
    } catch {
      // ignorat
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/courier-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", pin: pinInput }),
    });
    if (res.status === 401) {
      setLoginError("Cod incorect.");
      return;
    }
    const data = { name: nameInput, pin: pinInput };
    setCourier(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function logout() {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    localStorage.removeItem(STORAGE_KEY);
    setCourier(null);
  }

  useEffect(() => {
    if (!courier) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/courier-orders?courier=${encodeURIComponent(courier!.name)}`);
        const data = await res.json();
        if (!cancelled) {
          setAvailable(data.available ?? []);
          setMine(data.mine ?? []);
        }
      } catch {
        // reîncercăm la runda următoare
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [courier]);

  // O poziție inițială, o singură dată — ca harta să aibă imediat ce arăta,
  // chiar înainte de a porni transmiterea live către clienți.
  useEffect(() => {
    if (!courier || position || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, [courier, position]);

  async function claimOrder(orderId: string) {
    if (!courier) return;
    await fetch("/api/courier-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "claim", pin: courier.pin, orderId, courierName: courier.name }),
    });
    setAvailable((prev) => prev.filter((o) => o.id !== orderId));
  }

  async function markDelivered(orderId: string) {
    if (!courier) return;
    await fetch("/api/courier-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deliver", pin: courier.pin, orderId }),
    });
    setMine((prev) => prev.filter((o) => o.id !== orderId));
  }

  function startTracking() {
    if (!courier || !("geolocation" in navigator)) return;
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });

        const now = Date.now();
        if (now - lastSent.current < 5000) return;
        lastSent.current = now;

        await fetch("/api/courier-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "location", pin: courier.pin, courierName: courier.name, lat: latitude, lng: longitude }),
        });
      },
      () => setTracking(false),
      { enableHighAccuracy: true, maximumAge: 4000 }
    );
  }

  function stopTracking() {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setTracking(false);
  }

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const stopsWithCoords = mine.filter((o) => o.delivery_lat != null && o.delivery_lng != null);

  if (!courier) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-cream rounded-2xl p-8 w-full max-w-sm shadow-xl">
          <Image src="/images/logo.png" alt="Ocean Produs" width={64} height={64} className="w-16 h-16 mb-3" />
          <h1 className="font-display font-bold text-2xl text-navy mb-1">Curieri</h1>
          <p className="text-navy/60 text-sm mb-6">Intră cu numele tău și codul primit.</p>

          <label className="block text-sm font-semibold text-navy mb-1">Numele tău</label>
          <input
            required
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full border border-kraftDark rounded-lg px-3 py-2 mb-4 bg-white"
          />

          <label className="block text-sm font-semibold text-navy mb-1">Cod</label>
          <input
            required
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full border border-kraftDark rounded-lg px-3 py-2 mb-4 bg-white"
          />

          {loginError && <p className="text-coral text-sm mb-4">{loginError}</p>}

          <button type="submit" className="w-full bg-coral hover:bg-coralDark text-cream font-display font-bold py-3 rounded-lg">
            Intră
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="fixed inset-0 bg-cream">
      {/* Harta ocupă tot ecranul, în spate */}
      <div className="absolute inset-0">
        {position && stopsWithCoords.length > 0 ? (
          <CourierRouteMap
            origin={position}
            stops={stopsWithCoords.map((o) => ({
              orderId: o.id,
              lat: o.delivery_lat!,
              lng: o.delivery_lng!,
              label: o.customer_address,
            }))}
            onOptimized={(ordered, minutes) => {
              setRouteInfo(ordered.map((s) => ({ position: s.position, label: s.label })));
              setTotalMinutes(minutes);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-kraft/30 px-8 text-center">
            <p className="text-navy/50 text-sm">
              {!position ? "Se caută locația ta..." : "Preia o comandă ca să vezi traseul pe hartă."}
            </p>
          </div>
        )}
      </div>

      {/* Bară de sus, peste hartă */}
      <div className="absolute top-0 left-0 right-0 bg-navy/95 backdrop-blur text-cream px-4 py-3 flex items-center justify-between z-10">
        <div>
          <p className="font-display font-bold text-sm">Bună, {courier.name}</p>
          {totalMinutes !== null && stopsWithCoords.length > 0 && (
            <p className="text-cream/70 text-xs">Traseu optimizat — ~{totalMinutes} min</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!tracking ? (
            <button onClick={startTracking} className="text-coral text-sm font-semibold">
              Pornește
            </button>
          ) : (
            <button onClick={stopTracking} className="text-cream/80 text-sm font-semibold">
              Oprește
            </button>
          )}
          <button onClick={logout} className="text-cream/60 text-sm">
            Ieși
          </button>
        </div>
      </div>

      {/* Panou jos, cu comenzile — alunecă peste hartă */}
      <div
        className={`absolute left-0 right-0 bottom-0 bg-cream rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-10 transition-all duration-300 ${
          sheetExpanded ? "max-h-[65vh]" : "max-h-[64px]"
        } overflow-hidden flex flex-col`}
      >
        <button
          onClick={() => setSheetExpanded((v) => !v)}
          className="flex items-center justify-between px-5 py-4 shrink-0"
        >
          <span className="font-display font-bold text-navy">
            {mine.length} active · {available.length} disponibile
          </span>
          {sheetExpanded ? <ChevronDown size={20} className="text-navy/50" /> : <ChevronUp size={20} className="text-navy/50" />}
        </button>

        <div className="overflow-y-auto px-4 pb-6">
          {mine.length > 0 && (
            <section className="mb-5">
              <h2 className="font-display font-bold text-navy text-sm mb-2">Comenzile mele</h2>
              <div className="space-y-3">
                {mine.map((o) => {
                  const stopNumber = routeInfo.find((r) => r.label === o.customer_address)?.position;
                  return (
                    <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-navy">
                          {stopNumber && <span className="text-coral">#{stopNumber} </span>}
                          {o.customer_name}
                        </p>
                        <p className="font-display font-bold text-coral">{o.total.toFixed(2)} lei</p>
                      </div>
                      <p className="text-sm text-navy/70">{o.customer_phone}</p>
                      <p className="text-sm text-navy/50 mb-2">{o.customer_address}</p>
                      {o.delivery_slot && <p className="text-xs text-navy/40 mb-2">{o.delivery_slot}</p>}
                      <button
                        onClick={() => markDelivered(o.id)}
                        className="w-full bg-seafoam/20 text-seafoam font-semibold text-sm py-2 rounded-lg"
                      >
                        ✓ Marchează livrată
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h2 className="font-display font-bold text-navy text-sm mb-2">Comenzi disponibile</h2>
            {available.length === 0 && <p className="text-navy/50 text-sm">Nicio comandă de preluat momentan.</p>}
            <div className="space-y-3">
              {available.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-navy">#{o.order_number}</p>
                    <p className="font-display font-bold text-coral">{o.total.toFixed(2)} lei</p>
                  </div>
                  <p className="text-sm text-navy/70">{o.customer_name} · {o.customer_phone}</p>
                  <p className="text-sm text-navy/50 mb-2">{o.customer_address}</p>
                  {o.delivery_slot && <p className="text-xs text-navy/40 mb-2">{o.delivery_slot}</p>}
                  <button
                    onClick={() => claimOrder(o.id)}
                    className="w-full bg-coral hover:bg-coralDark text-cream font-semibold text-sm py-2 rounded-lg"
                  >
                    Preiau comanda
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
