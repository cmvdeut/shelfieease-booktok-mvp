"use client";

import React, { useEffect, useState } from "react";

export function CoverImg(
  props: React.ImgHTMLAttributes<HTMLImageElement> & {
    instant?: boolean;
    /** When the image fails, hide it so a sibling placeholder can show through. */
    hideOnError?: boolean;
  }
) {
  const { src, onError, style, instant, hideOnError = true, ...rest } = props;
  const [ok, setOk] = useState(Boolean(instant));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setOk(Boolean(instant) || String(src || "").toLowerCase().startsWith("/api/cover"));
  }, [src, instant]);

  if (!src || failed) return null;

  const lower = String(src).toLowerCase();
  // Only reject known Google "image not available" placeholders — not our /api/cover routes
  if (
    lower.includes("image_not_available") ||
    (lower.includes("books.google") && lower.includes("image") && lower.includes("not") && lower.includes("available"))
  ) {
    return null;
  }

  const preferInstant = Boolean(instant) || lower.startsWith("/api/cover");

  return (
    <img
      {...rest}
      src={src}
      style={{
        ...(style || {}),
        opacity: preferInstant || ok ? 1 : 0,
        transition: preferInstant ? "none" : "opacity 160ms ease",
      }}
      onLoad={(e) => {
        const img = e.currentTarget;
        const bad =
          img.naturalWidth <= 2 ||
          img.naturalHeight <= 2 ||
          String(img.currentSrc || src).toLowerCase().includes("image_not_available");

        if (bad) {
          setOk(false);
          if (hideOnError) setFailed(true);
          onError?.(e as any);
          return;
        }
        setOk(true);
      }}
      onError={(e) => {
        setOk(false);
        if (hideOnError) setFailed(true);
        onError?.(e as any);
      }}
      alt={props.alt || "cover"}
    />
  );
}
