"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadBooks } from "@/lib/storage";

export default function Home() {
  const [bookCount, setBookCount] = useState(0);

  useEffect(() => {
    const books = loadBooks();
    setBookCount(books.length);
  }, []);

  return (
    <main style={page}>
      <div style={hero}>
        <div style={kicker}>ShelfieEase • BookTok</div>
        <h1 style={h1}>📚 ShelfieEase</h1>
        <p style={subtitle}>
          Scan books. Build your shelf. Share the vibe.
        </p>
        <p style={description}>
          De eenvoudigste manier om je boekenverzameling bij te houden. 
          Scan je boeken met je telefoon en bouw je persoonlijke bibliotheek.
        </p>
        {bookCount > 0 && (
          <div style={statsBadge}>
            Je hebt al {bookCount} boek{bookCount === 1 ? "" : "en"} in je collectie!
          </div>
        )}
      </div>

      <div style={actions}>
        <Link href="/scan">
          <button style={btnPrimary}>
            <span style={btnIcon}>📷</span>
            Scan a book
          </button>
        </Link>
        <Link href="/library">
          <button style={btnSecondary}>
            <span style={btnIcon}>📚</span>
            My Shelf
          </button>
        </Link>
      </div>

      <div style={features}>
        <div style={feature}>
          <div style={featureIcon}>📱</div>
          <div style={featureTitle}>Scan met je telefoon</div>
          <div style={featureText}>Gebruik je camera om ISBN codes te scannen</div>
        </div>
        <div style={feature}>
          <div style={featureIcon}>🔍</div>
          <div style={featureTitle}>Automatische lookup</div>
          <div style={featureText}>Boekinfo en covers worden automatisch opgehaald</div>
        </div>
        <div style={feature}>
          <div style={featureIcon}>📊</div>
          <div style={featureTitle}>Track je progress</div>
          <div style={featureText}>Houd bij wat je leest, gelezen hebt of nog wilt lezen</div>
        </div>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  padding: 16,
  maxWidth: 980,
  margin: "0 auto",
  minHeight: "100vh",
};

const hero: React.CSSProperties = {
  textAlign: "center",
  padding: "40px 20px",
  marginBottom: 40,
};

const kicker: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.6,
  color: "#cfcfe6",
  opacity: 0.9,
  marginBottom: 8,
};

const h1: React.CSSProperties = {
  margin: "12px 0",
  fontSize: 48,
  fontWeight: 950,
  background: "linear-gradient(135deg, #6d5efc, #ff49f0)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  lineHeight: 1.1,
};

const subtitle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#cfcfe6",
  margin: "16px 0",
};

const description: React.CSSProperties = {
  fontSize: 16,
  color: "#b7b7b7",
  lineHeight: 1.6,
  maxWidth: 600,
  margin: "20px auto 0",
};

const actions: React.CSSProperties = {
  display: "grid",
  gap: 12,
  maxWidth: 400,
  margin: "0 auto 60px",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  borderRadius: 18,
  border: 0,
  background: "linear-gradient(135deg, #6d5efc, #ff49f0)",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: "0 12px 28px rgba(109,94,252,0.35)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const btnSecondary: React.CSSProperties = {
  width: "100%",
  padding: "16px 20px",
  borderRadius: 18,
  border: "1px solid #2a2a32",
  background: "#15151c",
  color: "#fff",
  fontWeight: 900,
  fontSize: 16,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "transform 0.2s ease, border-color 0.2s ease",
};

const btnIcon: React.CSSProperties = {
  fontSize: 20,
};

const features: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 24,
  marginTop: 60,
  padding: "40px 20px",
  background: "linear-gradient(135deg, rgba(109,94,252,0.08), rgba(255,73,240,0.05) 45%, rgba(0,0,0,0) 70%)",
  borderRadius: 24,
  border: "1px solid #2a2a32",
};

const feature: React.CSSProperties = {
  textAlign: "center",
  padding: 20,
};

const featureIcon: React.CSSProperties = {
  fontSize: 48,
  marginBottom: 16,
};

const featureTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "#fff",
  marginBottom: 8,
};

const featureText: React.CSSProperties = {
  fontSize: 14,
  color: "#b7b7b7",
  lineHeight: 1.5,
};

const statsBadge: React.CSSProperties = {
  marginTop: 24,
  padding: "12px 20px",
  borderRadius: 16,
  background: "rgba(109,94,252,0.15)",
  border: "1px solid rgba(109,94,252,0.3)",
  color: "#d8d8ff",
  fontSize: 14,
  fontWeight: 700,
  display: "inline-block",
};
