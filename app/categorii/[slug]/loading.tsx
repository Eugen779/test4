import Header from "@/components/Header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-12 pb-5">
        <div className="h-7 w-40 bg-kraft rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-square bg-kraft rounded-2xl animate-pulse" />
              <div className="h-4 w-4/5 bg-kraft rounded animate-pulse mt-2" />
              <div className="h-4 w-1/3 bg-kraft rounded animate-pulse mt-1" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
