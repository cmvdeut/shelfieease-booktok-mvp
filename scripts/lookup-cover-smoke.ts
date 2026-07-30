/**
 * Smoke-test ISBN lookup covers (NL + EN).
 * Run: npx tsx scripts/lookup-cover-smoke.ts
 */
const ISBNS: { isbn: string; label: string }[] = [
  // NL (incl. past misses)
  { isbn: "9789401613682", label: "NL Het weesmeisje (Anne Jacobs)" },
  { isbn: "9789461093691", label: "NL Vrij Spel (Linda Jansma)" },
  { isbn: "9789032509569", label: "NL Verboden vruchten (Jojo Moyes)" },
  { isbn: "9789025473877", label: "NL De proloog" },
  { isbn: "9789044647891", label: "NL Europa, Europa" },
  { isbn: "9789044634006", label: "NL Het pad van de gele slippers" },
  // EN
  { isbn: "9780141036144", label: "EN Nineteen Eighty-Four" },
  { isbn: "9781501110368", label: "EN It Ends With Us" },
  { isbn: "9780553381696", label: "EN A Clash of Kings" },
  { isbn: "9780316769484", label: "EN The Catcher in the Rye" },
  { isbn: "9780385534260", label: "EN Wager (David Grann)" },
  { isbn: "9780061120084", label: "EN To Kill a Mockingbird" },
  { isbn: "9780062315007", label: "EN The Alchemist" },
  { isbn: "9780553381689", label: "EN A Game of Thrones" },
];

async function main() {
  const base = process.env.LOOKUP_BASE || "http://127.0.0.1:3000";
  let fail = 0;
  for (const row of ISBNS) {
    const t0 = Date.now();
    try {
      const res = await fetch(`${base}/api/lookup?isbn=${row.isbn}`, { cache: "no-store" });
      const data = (await res.json()) as {
        title?: string;
        authors?: string[];
        coverUrl?: string;
      };
      const ms = Date.now() - t0;
      const hasTitle = Boolean(data.title?.trim());
      const hasCover = Boolean(data.coverUrl?.trim());
      let coverOk = hasCover;
      if (hasCover && data.coverUrl!.startsWith("/")) {
        const img = await fetch(`${base}${data.coverUrl}`, { cache: "no-store" });
        coverOk = img.ok;
        const len = Number(img.headers.get("content-length") || 0);
        if (img.ok && len > 0 && len < 1500) coverOk = false;
      }
      const status = hasTitle && coverOk ? "OK" : "FAIL";
      if (status === "FAIL") fail++;
      console.log(
        `${status} ${row.isbn} ${row.label} | title=${hasTitle ? data.title : "—"} | cover=${coverOk} | ${ms}ms`
      );
    } catch (e) {
      fail++;
      console.log(`FAIL ${row.isbn} ${row.label} | ${(e as Error).message}`);
    }
  }
  console.log(fail === 0 ? "\nALL PASSED" : `\n${fail} FAILURES`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
