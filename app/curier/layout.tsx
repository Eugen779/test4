import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ocean Produs — Curier",
  manifest: "/manifest-curier.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Curier",
  },
};

export default function CourierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
