"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, ShoppingCart, Image as ImageIcon, Settings } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

const links = [
  { href: "/admin", label: "Prezentare generală", icon: LayoutDashboard, exact: true },
  { href: "/admin/produse", label: "Produse", icon: Package },
  { href: "/admin/categorii", label: "Categorii", icon: Tags },
  { href: "/admin/comenzi", label: "Comenzi", icon: ShoppingCart },
  { href: "/admin/bannere", label: "Bannere & Homepage", icon: ImageIcon },
  { href: "/admin/setari", label: "Setări", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-60 shrink-0 bg-navy text-cream p-4 hidden sm:flex flex-col">
        <div className="px-2 mb-6">
          <h1 className="font-display font-bold text-lg">Ocean Produs</h1>
          <p className="text-cream/50 text-xs">Panou de administrare</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map((l) => {
            const active = isActive(l.href, l.exact);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? "bg-coral text-cream shadow-sm" : "text-cream/80 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton />
      </aside>

      {/* Navigare mobilă (tab-uri sus) */}
      <div className="flex-1 min-w-0">
        <div className="sm:hidden overflow-x-auto flex gap-2 p-3 bg-navy sticky top-0 z-10">
          {links.map((l) => {
            const active = isActive(l.href, l.exact);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full ${
                  active ? "bg-coral text-cream" : "text-cream/70 bg-cream/10"
                }`}
              >
                <l.icon size={14} />
                {l.label}
              </Link>
            );
          })}
        </div>
        <div key={pathname} className="p-5 admin-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
