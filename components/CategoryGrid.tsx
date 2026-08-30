import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="px-4 pt-2 pb-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-navy tracking-wide">
          CATEGORII POPULARE
        </h2>
        <Link href="/categorii" className="text-coral font-semibold text-sm flex items-center gap-1">
          Toate <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorii/${cat.slug}`}
            className="flex flex-col items-center gap-2 shrink-0 w-[72px] text-center"
          >
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden bg-kraft border border-kraftDark/40">
              {cat.image_url && (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  width={72}
                  height={72}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <span className="font-display font-semibold text-xs text-navy leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
