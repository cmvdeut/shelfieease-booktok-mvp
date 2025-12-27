"use client";

import { useState, useEffect, useRef } from "react";

function isBadImage(w: number, h: number): boolean {
  if (!w || !h) return true;
  if (w <= 2 && h <= 2) return true;
  const ratio = w / h;
  if (ratio > 2.2) return true;
  if (ratio < 0.45) return true;
  return false;
}

export function CoverImg({
  src,
  alt = "Book cover",
  style,
  onError,
}: {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  onError?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset failed state when src changes
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return null;
  }

  const handleError = () => {
    setFailed(true);
    onError?.();
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth || 0;
    const h = img.naturalHeight || 0;
    if (isBadImage(w, h)) {
      setFailed(true);
      onError?.();
    }
  };

  // Merge passed style with default image style
  // First apply defaults, then spread style, then override critical properties
  const finalImageStyle: React.CSSProperties = {
    // Default values
    minWidth: "100%",
    minHeight: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectPosition: "center",
    opacity: 1,
    display: "block",
    margin: 0,
    padding: 0,
    border: "none",
    boxSizing: "border-box",
    zIndex: 10,
    // Apply passed style (may override defaults)
    ...style,
    // Ensure critical properties are always set (override any style props)
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      style={finalImageStyle}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}

export default CoverImg;
