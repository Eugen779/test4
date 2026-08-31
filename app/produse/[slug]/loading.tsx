import Header from "@/components/Header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="relative aspect-square bg-kraft animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-6 w-2/3 bg-kraft rounded animate-pulse" />
        <div className="h-8 w-1/3 bg-kraft rounded animate-pulse" />
        <div className="h-4 w-full bg-kraft rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-kraft rounded animate-pulse" />
        <div className="h-12 w-full bg-kraft rounded-badge animate-pulse mt-4" />
      </div>
    </main>
  );
}
