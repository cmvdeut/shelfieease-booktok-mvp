"use client";

import { useState, useEffect, useRef } from "react";

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
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!src || hasError) {
    return null;
  }

  // Check if image is already loaded (cached images)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalHeight !== 0) {
      setIsLoaded(true);
      console.log("CoverImg already loaded (cached):", src);
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("CoverImg error for URL:", src, e);
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    console.log("CoverImg loaded successfully:", src);
    setIsLoaded(true);
  };

  // Use native img tag for better control and to avoid Next.js Image wrapper issues
  const imageStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 1, // Always visible, no fade-in needed
    display: "block",
    ...style, // Merge passed style after to allow overrides
  };

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      style={imageStyle}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}

export default CoverImg;
