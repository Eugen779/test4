import type { Metadata, Viewport } from "next";
import { Baloo_2, Inter, Caveat } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Ocean Produs — Calitate superioară direct din ocean",
  description: "Icre, fructe de mare și conserve premium, livrate la ușa ta.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ocean Produs",
  },
};

export const viewport: Viewport = {
  themeColor: "#C8342E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className={`${baloo.variable} ${inter.variable} ${caveat.variable} font-body bg-cream text-navy`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
