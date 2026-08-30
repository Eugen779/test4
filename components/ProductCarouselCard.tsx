import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

// Card compact, gândit pentru un rând orizontal cu scroll (carusel),
// nu pentru grid — folosit la "S-ar putea să-ți placă și" pe pagina de produs.
export default function ProductCarouselCard({ product }: { product: Product }) {
  return (
    <Link href={`/produse/${product.slug}`} className="block w-32 shrink-0">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-kraft">
        {product.images[0] && (
          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
        )}
      </div>
      <p className="mt-1.5 font-display font-semibold text-xs text-navy line-clamp-2 leading-tight">
        {product.name}
      </p>
      <p className="font-display font-bold text-coral text-sm mt-0.5">
        {product.price.toFixed(2)} lei
        {product.unit === "kg" && <span className="text-[10px] font-body font-normal text-navy/50">/kg</span>}
      </p>
    </Link>
  );
}
