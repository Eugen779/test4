"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Banner } from "@/lib/types";

// Slider hero — toate bannerele stau într-o "bandă" orizontală care alunecă
// (translateX animat). Avansează singur la 5 secunde și poate fi tras
// (swipe) cu degetul, stânga/dreapta.
export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  function goTo(index: number) {
    setActive((index + banners.length) % banners.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 40;
    if (deltaX > SWIPE_THRESHOLD) {
      goTo(active - 1); // swipe la dreapta → slide anterior
    } else if (deltaX < -SWIPE_THRESHOLD) {
      goTo(active + 1); // swipe la stânga → slide următor
    }
    touchStartX.current = null;
  }

  return (
    <div
      className="relative w-full aspect-[3/2] sm:aspect-[21/9] overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <div key={banner.id} className="relative w-full h-full shrink-0">
            <Image
              src={banner.image_url}
              alt={banner.title ?? ""}
              fill
              priority={i === 0}
              className="object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/5 to-transparent" />
            <div className="absolute bottom-5 left-0 right-0 px-6">
              {banner.title && (
                <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-cream drop-shadow-sm">
                  {banner.title}
                </h1>
              )}
              {banner.subtitle && (
                <p className="mt-1 text-cream/90 font-body text-base max-w-md">{banner.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
          {banners.map((b, i) => (
            <button
              key={b.id}
              aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-cream" : "w-1.5 bg-cream/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
