import type { Config } from "tailwindcss";

// Token-uri de design — derivate din identitatea "Ocean Produs":
// hârtie kraft, funie, plasă de pescuit, accent coral pe navy adânc.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kraft: "#E4D5B7",      // hârtie kraft / nisip — fundal secțiuni
        kraftDark: "#C9B48C",  // umbră kraft
        navy: "#16233D",       // navy adânc — text, header
        coral: "#C8342E",      // accent roșu-coral — CTA, reduceri
        coralDark: "#A32620",
        cream: "#FBF6EC",      // fundal pagină
        rope: "#8B6F47",       // maro funie — dividere, iconițe
        seafoam: "#7FA69A",    // verde-albăstrui discret — stări succes
      },
      fontFamily: {
        display: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
      },
      borderRadius: {
        badge: "9999px",
      },
      backgroundImage: {
        "kraft-texture": "url('/images/kraft-texture.jpg')",
      },
    },
  },
  plugins: [],
} satisfies Config;
