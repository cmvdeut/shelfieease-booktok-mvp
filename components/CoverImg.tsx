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

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    console.log("CoverImg src changed, resetting error state:", src);
  }, [src]);

  if (!src || hasError) {
    return null;
  }

  // Check if image is already loaded (cached images)
  useEffect(() => {
    console.log("CoverImg mounted/updated:", src);
    if (imgRef.current) {
      console.log("Image element:", {
        complete: imgRef.current.complete,
        naturalWidth: imgRef.current.naturalWidth,
        naturalHeight: imgRef.current.naturalHeight,
        clientWidth: imgRef.current.clientWidth,
        clientHeight: imgRef.current.clientHeight,
        offsetWidth: imgRef.current.offsetWidth,
        offsetHeight: imgRef.current.offsetHeight,
      });
      if (imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
        setIsLoaded(true);
        console.log("CoverImg already loaded (cached):", src);
      }
    }
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("CoverImg error for URL:", src, e);
    setHasError(true);
    onError?.();
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    console.log("CoverImg loaded successfully:", src, {
      naturalWidth: w,
      naturalHeight: h,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
      offsetWidth: img.offsetWidth,
      offsetHeight: img.offsetHeight,
      computedStyle: window.getComputedStyle(img),
    });

    // Detect bad cover (strip/invalid/placeholder)
    // Regels:
    // - te laag: h < 120 (strip)
    // - of extreme verhouding: w / h > 2.2 (extreme horizontale strip)
    // - of OpenLibrary placeholder: w <= 2 && h <= 2
    // - of h === 0
    const isBadCover = 
      !h || 
      h < 120 || 
      (h > 0 && w / h > 2.2) ||
      (w <= 2 && h <= 2);

    if (isBadCover) {
      console.warn("CoverImg: Bad cover detected (strip/invalid/placeholder):", {
        width: w,
        height: h,
        aspectRatio: h > 0 ? (w / h).toFixed(2) : "N/A",
        isOpenLibraryPlaceholder: w <= 2 && h <= 2,
        src,
      });
      // Treat as error - trigger onError callback to clear coverUrl
      setHasError(true);
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
      {/* Debug: show a visible indicator if image is rendered */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: "absolute",
          top: 4,
          left: 4,
          background: "rgba(0,255,0,0.8)",
          color: "#000",
          fontSize: 10,
          padding: "2px 4px",
          borderRadius: 4,
          zIndex: 9999,
          pointerEvents: "none",
        }}>
          IMG
        </div>
      )}
    </>
  );
}

export default CoverImg;
