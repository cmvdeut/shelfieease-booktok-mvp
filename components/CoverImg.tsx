"use client";

import { useState } from "react";

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

  if (!src || hasError) {
    return null;
  }

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
    ...style,
    position: "absolute",
    inset: 0,
    zIndex: 2, // Higher z-index to ensure it's above placeholder
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: isLoaded ? 1 : 0, // Fade in when loaded
    display: "block",
    transition: "opacity 0.2s ease-in-out",
  };

  return (
    <img
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
