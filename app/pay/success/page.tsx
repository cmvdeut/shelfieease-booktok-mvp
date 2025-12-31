"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tPay } from "@/lib/i18n";

export default function PaySuccessPage() {
  const [status, setStatus] = useState<"checking" | "ok" | "fail">("checking");

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) {
      setStatus("fail");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (data?.paid) {
          localStorage.setItem("se:pro", "1");
          setStatus("ok");
        } else {
          setStatus("fail");
        }
      } catch {
        setStatus("fail");
      }
    })();
  }, []);

  return (
    <main style={{ padding: 18, maxWidth: 720, margin: "0 auto" }}>
      {status === "checking" && <h1>{tPay("checking")}</h1>}
      {status === "ok" && (
        <>
          <h1>{tPay("unlockedTitle")}</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            {tPay("unlockedBody")}
          </p>
          <Link href="/library" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            {tPay("goLibrary")}
          </Link>
        </>
      )}
      {status === "fail" && (
        <>
          <h1>{tPay("notConfirmedTitle")}</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            {tPay("notConfirmedBody")}
          </p>
          <Link href="/library" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            {tPay("back")}
          </Link>
        </>
      )}
    </main>
  );
}
