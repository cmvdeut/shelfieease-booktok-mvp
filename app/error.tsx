"use client";

import { useEffect } from "react";
import { isChunkLoadError, tryRecoverFromChunkError } from "@/lib/chunk-reload";

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    if (isChunkLoadError(error.message)) {
      tryRecoverFromChunkError();
    }
  }, [error]);

  if (isChunkLoadError(error.message)) {
    return (
      <div
        style={{
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          color: "var(--text)",
        }}
      >
        <p style={{ margin: 0, opacity: 0.85 }}>Update laden…</p>
      </div>
    );
  }

  return null;
}
