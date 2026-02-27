"use client";

import { useEffect, useState } from "react";

interface TikTokPost {
  caption: string;
  caption_preview: string;
  scheduled_label: string;
  video_file: string;
  scheduled_time_unix: number;
  uploaded_at?: number;
}

interface TikTokData {
  pending: TikTokPost | null;
  upcoming: TikTokPost[];
  updated_at: number;
}

function splitCaption(caption: string): { body: string; hashtags: string } {
  const lines = caption.split("\n");
  const idx = lines.findIndex((l) => l.trim().startsWith("#"));
  if (idx === -1) return { body: caption.trim(), hashtags: "" };
  return {
    body: lines.slice(0, idx).join("\n").trim(),
    hashtags: lines.slice(idx).join(" ").trim(),
  };
}

function videoName(file: string) {
  return file.split("/").pop() ?? file;
}

function CopyButton({
  text,
  label,
  successLabel,
  primary,
}: {
  text: string;
  label: string;
  successLabel: string;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <button
      onClick={copy}
      style={{
        width: "100%",
        padding: primary ? "18px 24px" : "14px 24px",
        borderRadius: 14,
        border: "none",
        background: copied
          ? "rgba(34,197,94,0.2)"
          : primary
          ? "var(--accent1)"
          : "var(--panel)",
        color: copied ? "#4ade80" : primary ? "#fff" : "var(--muted)",
        fontSize: primary ? 18 : 15,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
        letterSpacing: "0.2px",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: copied
          ? "rgba(34,197,94,0.4)"
          : primary
          ? "transparent"
          : "var(--border)",
      }}
    >
      {copied ? `✓ ${successLabel}` : label}
    </button>
  );
}

function PostCard({
  post,
  label,
  highlight,
}: {
  post: TikTokPost;
  label: string;
  highlight?: boolean;
}) {
  const { body, hashtags } = splitCaption(post.caption);

  return (
    <div
      style={{
        background: highlight ? "rgba(255,255,255,0.04)" : "var(--panel)",
        border: `1px solid ${highlight ? "var(--accent1)" : "var(--border)"}`,
        borderRadius: 18,
        padding: "20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.5px",
            color: highlight ? "var(--accent1)" : "var(--muted)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span>🗓 {post.scheduled_label}</span>
          <span style={{ color: "var(--border)" }}>·</span>
          <span>🎬 {videoName(post.video_file)}</span>
        </div>
      </div>

      {/* Caption preview */}
      <div
        style={{
          background: "var(--bg)",
          borderRadius: 10,
          padding: "14px 16px",
          fontSize: 14,
          color: "var(--text)",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: 160,
          overflowY: "auto",
          border: "1px solid var(--border)",
        }}
      >
        {body}
        {hashtags && (
          <span style={{ color: "var(--muted)", display: "block", marginTop: 10 }}>
            {hashtags}
          </span>
        )}
      </div>

      {/* Copy buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <CopyButton
          text={post.caption}
          label="📋 Kopieer volledige caption"
          successLabel="Gekopieerd!"
          primary={highlight}
        />
        {hashtags && (
          <CopyButton
            text={hashtags}
            label="# Kopieer alleen hashtags"
            successLabel="Hashtags gekopieerd!"
          />
        )}
        {body && (
          <CopyButton
            text={body}
            label="💬 Kopieer alleen tekst (zonder hashtags)"
            successLabel="Tekst gekopieerd!"
          />
        )}
      </div>
    </div>
  );
}

export default function TikTokCaptionPage() {
  const [data, setData] = useState<TikTokData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/tiktok-data.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const updatedLabel = data?.updated_at
    ? new Date(data.updated_at * 1000).toLocaleString("nl-NL", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        color: "var(--text)",
        padding: "24px 16px 60px",
        maxWidth: 520,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>📱</span>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
              color: "var(--text)",
            }}
          >
            TikTok Caption Helper
          </h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
          Kopieer de caption voor de video die in je TikTok inbox staat.
        </p>
        {updatedLabel && (
          <p style={{ fontSize: 12, color: "var(--muted2, var(--muted))", margin: "6px 0 0", opacity: 0.7 }}>
            Bijgewerkt: {updatedLabel}
          </p>
        )}
      </div>

      {/* Loading */}
      {!data && !error && (
        <div style={{ color: "var(--muted)", fontSize: 15, textAlign: "center", paddingTop: 40 }}>
          Laden…
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 12,
            padding: "16px 18px",
            color: "#f87171",
            fontSize: 14,
          }}
        >
          Kon data niet laden. Probeer de pagina te verversen.
        </div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Pending (in inbox) */}
          {data.pending ? (
            <PostCard post={data.pending} label="📥 In je TikTok inbox" highlight />
          ) : (
            <div
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: "20px 18px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
              <div>Geen video in inbox — alles is gepubliceerd!</div>
            </div>
          )}

          {/* Upcoming */}
          {data.upcoming.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  marginBottom: 12,
                  paddingLeft: 2,
                }}
              >
                📅 Ingepland
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.upcoming.map((post, i) => (
                  <PostCard key={i} post={post} label={post.scheduled_label} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!data.pending && data.upcoming.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
                paddingTop: 20,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div>Geen posts ingepland.</div>
              <div style={{ marginTop: 6, opacity: 0.7 }}>
                Voeg posts toe aan scheduled-posts.json en commit naar GitHub.
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
