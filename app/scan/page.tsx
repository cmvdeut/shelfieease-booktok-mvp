"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Scanner from "@/components/Scanner";

function normalizeIsbn(raw: string) {
  return raw.toUpperCase().replace(/[^0-9X]/g, "");
}

export default function ScanPage() {
  const router = useRouter();
  const [manual, setManual] = useState("");
  const [lastScan, setLastScan] = useState<string | null>(null);

  const manualNormalized = useMemo(() => normalizeIsbn(manual), [manual]);

  const onDetected = useCallback(
    (isbn: string) => {
      setLastScan(isbn);

      // ⬇️ Pas dit aan naar jouw bestaande flow:
      // bijv. router.push(`/add?isbn=${isbn}`) of direct add-to-shelf in localStorage.
      router.push(`/add?isbn=${encodeURIComponent(isbn)}`);
    },
    [router]
  );

  const submitManual = useCallback(() => {
    const v = manualNormalized;
    if (!v) return;
    router.push(`/add?isbn=${encodeURIComponent(v)}`);
  }, [manualNormalized, router]);

  return (
    <div className="min-h-[100dvh] px-4 pt-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          className="px-3 py-2 rounded-lg border text-sm"
          onClick={() => router.push("/")}
          type="button"
        >
          ← Home
        </button>
        <div className="text-sm opacity-70">Scan ISBN</div>
        <button
          className="px-3 py-2 rounded-lg border text-sm"
          onClick={() => router.push("/library")}
          type="button"
        >
          My Shelf
        </button>
      </div>

      {/* Scanner */}
      <div className="mb-6">
        <Scanner
          onDetected={onDetected}
          onClose={() => router.push("/")}
        />
        {lastScan ? (
          <div className="mt-3 text-xs opacity-70">
            Laatste scan: <span className="font-medium">{lastScan}</span>
          </div>
        ) : null}
      </div>

      {/* Handmatige fallback */}
      <div className="rounded-2xl border p-4">
        <div className="text-sm font-medium mb-2">Of voer ISBN handmatig in</div>

        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            placeholder="Bijv. 9789022591260"
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
          <button
            onClick={submitManual}
            className="px-3 py-2 rounded-xl bg-black text-white text-sm"
            type="button"
          >
            Zoek
          </button>
        </div>

        <div className="mt-2 text-xs opacity-70">
          Tip: kopieer ook gerust een ISBN uit de productpagina van een boek.
        </div>
      </div>
    </div>
  );
}
