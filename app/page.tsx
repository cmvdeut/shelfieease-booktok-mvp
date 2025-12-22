import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#0b0b10] text-white">
      {/* zachte achtergrondglow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md px-6 pt-10 pb-12">
        {/* Brand */}
        <header className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 shadow">
            <span className="text-2xl">📚</span>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              ShelfieEase
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Scan • Shelf • Share (zonder gedoe)
            </p>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold leading-tight">
            Maak je BookTok-shelf in seconden.
          </h2>
          <p className="mt-3 text-base text-white/80">
            Scan een ISBN of typ ‘m in. Zet boeken in shelves. Deel je 9:16
            shelfie-card voor TikTok/Instagram.
          </p>

          {/* CTA */}
          <div className="mt-7 grid gap-3">
            <Link
              href="/scan"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-semibold
                         bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold
                           bg-white/10 ring-1 ring-white/15 shadow active:scale-[0.99]"
              >
                <span>📚</span> My Shelf
              </Link>

              <Link
                href="/scan"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base font-semibold
                           bg-white/5 ring-1 ring-white/10 active:scale-[0.99]"
              >
                <span>⌨️</span> Handmatig
              </Link>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-10 grid gap-3">
          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/90">
                  Geen stress stats
                </div>
                <div className="mt-1 text-sm text-white/70">
                  Gewoon jouw vibe: TBR • Reading • Finished.
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                ✨
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/90">
                  Shelves met emoji
                </div>
                <div className="mt-1 text-sm text-white/70">
                  Maak je eigen mini-collecties (📖🌙🔥💜).
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                🧺
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/90">
                  Deel je Shelfie
                </div>
                <div className="mt-1 text-sm text-white/70">
                  9:16 share-card klaar voor TikTok/Instagram.
                </div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                🪄
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-xs text-white/55">
          Tip: open op mobiel voor de fijnste scan-ervaring.{" "}
          <span className="text-white/70">Handmatig invoeren blijft altijd.</span>
        </footer>
      </div>
    </main>
  );
}
