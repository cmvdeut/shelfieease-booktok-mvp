import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#0b0b10] text-white">
      <div className="mx-auto max-w-md px-6 pt-10">
        <div className="flex items-center gap-3">
          <div className="text-3xl">📚</div>
          <h1 className="text-4xl font-extrabold tracking-tight">ShelfieEase</h1>
        </div>

        <p className="mt-4 text-lg text-white/80">
          Scan books. Build your shelf. Share the vibe.
        </p>

        <div className="mt-8 grid gap-3">
          <Link
            href="/scan"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-4 text-lg font-semibold
                       bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20
                       active:scale-[0.99]"
          >
            📷 Scan a book
          </Link>

          <Link
            href="/library"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-4 text-lg font-semibold
                       bg-white/10 ring-1 ring-white/15 shadow
                       active:scale-[0.99]"
          >
            📚 My Shelf
          </Link>
        </div>
      </div>
    </main>
  );
}