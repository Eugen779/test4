import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Înlocuiește cu domeniul proiectului tău Supabase, ex: abcdefgh.supabase.co
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
