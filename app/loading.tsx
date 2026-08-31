import Header from "@/components/Header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="w-full aspect-[3/2] sm:aspect-[21/9] bg-kraft animate-pulse" />
      <div className="px-4 pt-3 pb-2">
        <div className="h-14 w-full bg-white rounded-full animate-pulse shadow-sm" />
      </div>
      <div className="px-4 pt-2 pb-3">
        <div className="h-5 w-40 bg-kraft rounded animate-pulse mb-4" />
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[72px] shrink-0">
              <div className="w-[72px] h-[72px] rounded-full bg-kraft animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
