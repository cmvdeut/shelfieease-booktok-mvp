// components/CoverImg.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  onError?: () => void;
};

export function CoverImg({ onError, ...props }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [hidden, setHidden] = useState(false);

  const markBad = () => {
    if (!hidden) setHidden(true);
    onError?.();
  };

  const validateNaturalSize = (img: HTMLImageElement) => {
    const w = img.naturalWidth || 0;
    const h = img.naturalHeight || 0;
    if (!w || !h) return;

    const ratio = w / h;

    // BAD: very wide "strip" (e.g. 300x48) or tiny-height placeholders
    if (ratio > 1.35 || h < 120) {
      markBad();
    }
  };

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // if cached, validate immediately
    if (img.complete) {
      validateNaturalSize(img);
    }
  }, [props.src]);

  if (!props.src || hidden) return null;

  return (
    <img
      {...props}
      ref={imgRef}
      onLoad={(e) => {
        const img = e.currentTarget;
        validateNaturalSize(img);
        props.onLoad?.(e);
      }}
      onError={(e) => {
        markBad();
        props.onError?.(e);
      }}
    />
  );
}
