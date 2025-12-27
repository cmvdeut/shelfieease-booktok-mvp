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
  const [hidden, setHidden] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setHidden(false);
    setIsLoaded(false);
  }, [src]);

  if (!src) {
    return null;
  }

  // Check if image is already loaded (cached images)
  useEffect(() => {
    if (imgRef.current) {
      if (imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
        setIsLoaded(true);
      }
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setHidden(true);
    onError?.();
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const el = e.currentTarget;
    const w = el.naturalWidth;
    const h = el.naturalHeight;

    // Detect invalid/unusable images that loaded but are not usable
    // Rules:
    // - naturalWidth <= 1 or naturalHeight <= 1 => invalid (Open Library 1x1 placeholder)
    // - extreme wide strip: naturalWidth / naturalHeight > 3.2 => invalid
    const isInvalid = 
      w <= 1 || 
      h <= 1 || 
      (h > 0 && w / h > 3.2);

    if (isInvalid) {
      // Treat as error - hide image and trigger onError callback
      setHasError(true);
      setHidden(true);
      onError?.();
      return;
    }

    setIsLoaded(true);
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
    opacity: hidden ? 0 : 1,
    display: hidden ? "none" : "block",
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
    <>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={finalImageStyle}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
}

export default CoverImg;
