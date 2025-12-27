"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  onError?: () => void;
};

function isLikelyBadCover(img: HTMLImageElement) {
  const w = img.naturalWidth || 0;
  const h = img.naturalHeight || 0;

  // 1) 1x1 / tiny pixels (common for placeholders)
  if (w <= 2 && h <= 2) return true;
  if (w < 40 || h < 60) return true; // too small to be a cover

  // 2) "strip" images (very wide and short) like 300x48
  const ratio = w / h;
  if (ratio > 1.6) return true; // covers are normally portrait-ish

  // 3) Sometimes OL placeholder returns weird aspect; treat very flat as bad
  if (h < 120 && w > 200) return true;

  return false;
}

export function CoverImg({ src, onError, style, ...rest }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [hidden, setHidden] = useState(false);

  const normalizedSrc = useMemo(() => {
    const s = (src || "").trim();
    // normalize http -> https
    if (s.startsWith("http://")) return s.replace("http://", "https://");
    return s;
  }, [src]);

  useEffect(() => {
    // whenever src changes, show again (we may hide only if it's a bad image)
    setHidden(false);
  }, [normalizedSrc]);

  if (!normalizedSrc || hidden) return null;

  return (
    <img
      ref={imgRef}
      src={normalizedSrc}
      {...rest}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
      onLoad={(e) => {
        const img = e.currentTarget;
        // If the server returned a placeholder / strip, hide it and let parent fallback UI show.
        if (isLikelyBadCover(img)) {
          setHidden(true);
          onError?.();
          return;
        }
        rest.onLoad?.(e);
      }}
      onError={(e) => {
        setHidden(true);
        onError?.();
        rest.onError?.(e);
      }}
      // Helps with some hosts + avoids referrer issues
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      loading={rest.loading ?? "lazy"}
      decoding={rest.decoding ?? "async"}
    />
  );
}
