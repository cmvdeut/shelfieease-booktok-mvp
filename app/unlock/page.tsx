"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { markAsPro } from "@/lib/demo";
import Link from "next/link";

export default function UnlockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"checking" | "success" | "invalid" | "used">("checking");
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    const codeParam = searchParams.get("code");
    
    if (!codeParam) {
      setStatus("invalid");
      return;
    }

    setCode(codeParam);
    validateCode(codeParam);
  }, [searchParams]);

  const validateCode = async (codeToValidate: string) => {
    try {
      const res = await fetch(`/api/promo/validate?code=${encodeURIComponent(codeToValidate)}`);
      
      if (!res.ok) {
        // If API returns error, check response
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Validation failed:", errorData);
        
        if (errorData.error?.includes("already been used")) {
          setStatus("used");
        } else {
          setStatus("invalid");
        }
        return;
      }
      
      const data = await res.json();

      if (data.valid) {
        // Unlock Pro
        markAsPro();
        setStatus("success");
        
        // Dispatch storage event to update UI
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
        }
        
        // Redirect to library after 2 seconds
        setTimeout(() => {
          router.push("/library");
        }, 2000);
      } else {
        if (data.error?.includes("already been used")) {
          setStatus("used");
        } else {
          setStatus("invalid");
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
      // Show more helpful error message
      setStatus("invalid");
    }
  };

  if (status === "checking") {
    return (
      <main style={{ padding: 24, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ marginBottom: 16 }}>Validating code...</h1>
        <p style={{ color: "var(--muted)" }}>Please wait</p>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main style={{ padding: 24, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h1 style={{ marginBottom: 16 }}>Pro Unlocked!</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          Your Pro access has been activated. Redirecting to your library...
        </p>
        <Link
          href="/library"
          style={{
            color: "var(--accent)",
            textDecoration: "underline",
          }}
        >
          Go to Library
        </Link>
      </main>
    );
  }

  if (status === "used") {
    return (
      <main style={{ padding: 24, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ marginBottom: 16 }}>Code Already Used</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          This promo code has already been used. Each code can only be used once.
        </p>
        <Link
          href="/library"
          style={{
            color: "var(--accent)",
            textDecoration: "underline",
          }}
        >
          Back to Library
        </Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
      <h1 style={{ marginBottom: 16 }}>Invalid Code</h1>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>
        The promo code "{code}" is not valid. Please check the code and try again.
      </p>
      <Link
        href="/library"
        style={{
          color: "var(--accent)",
          textDecoration: "underline",
        }}
      >
        Back to Library
      </Link>
    </main>
  );
}
