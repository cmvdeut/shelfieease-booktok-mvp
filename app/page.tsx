import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#0b0b10] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md px-6 pt-7 pb-9">
        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 shadow">
            <span className="text-2xl">📚</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
              ShelfieEase
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Scan • Shelf • Share
            </p>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-6">
          <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
            Maak je BookTok-shelf in seconden.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white/80">
            Scan een ISBN of typ ’m in. Zet boeken in shelves. Klaar.
          </p>

          {/* Actions */}
          <div className="mt-5 grid gap-3">
            <Link
              href="/scan"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5
                         text-base sm:text-lg font-semibold
                         bg-gradient-to-r from-violet-500 to-fuchsia-500
                         shadow-lg shadow-fuchsia-500/20
                         ring-1 ring-white/10 active:scale-[0.99]"
            >
              <span className="text-xl">📷</span>
              Scan a book
              <span className="opacity-80 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/library"
                className="inline-flex items-center justify-center gap-2 rounded-2xl
                           px-4 py-2.5 text-sm sm:text-base font-semibold
                           bg-white/10 ring-1 ring-white/15 shadow
                           active:scale-[0.99]"
              >
                <span>📚</span> My Shelf
              </Link>

              <Link
                href="/scan"
                className="inline-flex items-center justify-center gap-2 rounded-2xl
                           px-4 py-2.5 text-sm sm:text-base font-semibold
                           bg-white/5 ring-1 ring-white/10
                           active:scale-[0.99]"
              >
                <span>⌨️</span> Handmatig
              </Link>
            </div>
          </div>

          {/* Compact feature chips */}
          <div className="mt-5 grid gap-2">
            <div className="flex items-center justify-between rounded-2xl
                            bg-white/5 ring-1 ring-white/10 px-4 py-2.5">
              <div>
                <div className="text-sm font-semibold">Geen stress stats</div>
                <div className="text-xs text-white/70">
                  TBR • Reading • Finished
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-2xl
                              bg-white/10 ring-1 ring-white/10">
                ✨
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl
                            bg-white/5 ring-1 ring-white/10 px-4 py-2.5">
              <div>
                <div className="text-sm font-semibold">Shelves met emoji</div>
                <div className="text-xs text-white/70">
                  Mini-collecties (📖🌙🔥💜)
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-2xl
                              bg-white/10 ring-1 ring-white/10">
                🧺
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl
                            bg-white/5 ring-1 ring-white/10 px-4 py-2.5">
              <div>
                <div className="text-sm font-semibold">Deel je Shelfie</div>
                <div className="text-xs text-white/70">
                  9:16 share-card
                </div>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-2xl
                              bg-white/10 ring-1 ring-white/10">
                🪄
              </div>
            </div>
          </div>

          <footer className="mt-4 text-[11px] text-white/55">
            Tip: Handmatig invoeren blijft altijd mogelijk.
          </footer>
        </section>
      </div>
    </main>
  );
}
