"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

// Header prezent pe fiecare pagină — logo-ul real, click te duce la homepage.
// Meniul hamburger deschide un sertar lateral cu navigare.
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-kraftDark/40">
        <div className="relative max-w-6xl mx-auto flex items-center justify-between px-4 py-1.5">
          <button aria-label="Deschide meniul" onClick={() => setMenuOpen(true)} className="p-2 -ml-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          {/* Logo mai mare, "prins" de header — centrul lui stă exact pe
              marginea de jos a header-ului, ca să iasă puțin peste conținutul de sub el. */}
          <Link
            href="/"
            aria-label="Acasă"
            className="absolute left-1/2 -translate-x-1/2 top-full -translate-y-1/2 z-10"
          >
            <Image src="/images/logo.png" alt="Ocean Produs" width={96} height={96} className="w-24 h-24 drop-shadow-md" priority />
          </Link>

          <CartLink />
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cos" aria-label="Coșul tău" className="relative p-2 -mr-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-coral text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}

const menuLinks = [
  { href: "/", label: "Acasă" },
  { href: "/produse", label: "Toate produsele" },
  { href: "/comanda-mea", label: "Comanda mea" },
  { href: "/cos", label: "Coșul meu" },
];

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Fundal întunecat — click pentru închidere */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-navy/50 z-50 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sertar lateral */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[80vw] bg-cream z-50 shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-kraftDark/30">
          <Image src="/images/logo.png" alt="Ocean Produs" width={48} height={48} className="w-12 h-12" />
          <button aria-label="Închide meniul" onClick={onClose} className="p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-3">
          {menuLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="px-3 py-3 rounded-lg font-display font-semibold text-navy hover:bg-kraft/40"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
