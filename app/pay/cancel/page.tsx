"use client";

import Link from "next/link";
import { tPay } from "@/lib/i18n";

export default function PayCancelPage() {
  return (
    <main style={{ padding: 18, maxWidth: 720, margin: "0 auto" }}>
      <h1>{tPay("canceledTitle")}</h1>
      <p>{tPay("canceledBody")}</p>
      <Link href="/library">{tPay("backToLibrary")}</Link>
    </main>
  );
}
