import Link from "next/link";
import Header from "@/components/Header";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ numar?: string }>;
}) {
  const { numar } = await searchParams;

  return (
    <main className="min-h-screen bg-cream">
      <Header />
      <div className="px-4 pt-16 pb-16 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-full bg-seafoam/20 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7FA69A" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-2xl text-navy mb-2">Comandă trimisă!</h1>
        {numar && (
          <p className="text-navy/60 mb-1">
            Număr comandă: <span className="font-semibold text-navy">{numar}</span>
          </p>
        )}
        <p className="text-navy/60 mb-6">Te vom contacta în curând pentru confirmare.</p>
        <Link href="/" className="inline-block bg-coral text-cream font-display font-bold px-8 py-3 rounded-badge">
          Înapoi la magazin
        </Link>
      </div>
    </main>
  );
}
