"use client";

import React, { useEffect, useState } from "react";

export function CoverImg(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, onError, style, ...rest } = props;
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(false);
  }, [src]);

  if (!src) return null;

  const lower = String(src).toLowerCase();
  if (lower.includes("image_not_available") || (lower.includes("image") && lower.includes("not") && lower.includes("available"))) {
    return null;
  }

  return (
    <img
      {...rest}
      src={src}
      style={{
        ...(style || {}),
        opacity: ok ? 1 : 0,
        transition: "opacity 160ms ease",
      }}
      onLoad={(e) => {
        const img = e.currentTarget;
        const bad =
          img.naturalWidth <= 2 ||
          img.naturalHeight <= 2 ||
          String(img.currentSrc || src).toLowerCase().includes("image_not_available");

        if (bad) {
          setOk(false);
          onError?.(e as any);
          return;
        }
        setOk(true);
      }}
      onError={(e) => {
        setOk(false);
        onError?.(e as any);
      }}
      alt={props.alt || "cover"}
    />
  );
}
