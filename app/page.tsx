import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>📚 ShelfieEase</h1>
      <p style={{ color: "#b7b7b7" }}>
        Scan books. Build your shelf. Share the vibe.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        <Link href="/scan">
          <button style={btnPrimary}>Scan a book</button>
        </Link>
        <Link href="/library">
          <button style={btnSecondary}>My Shelf</button>
        </Link>
      </div>
    </main>
  );
}

const btnPrimary = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: 0,
  background: "#6d5efc",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
} as const;

const btnSecondary = {
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: 0,
  background: "#2a2a32",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer"
} as const;
