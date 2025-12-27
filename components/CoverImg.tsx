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
    console.log("CoverImg loaded successfully:", src, {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
      offsetWidth: img.offsetWidth,
      offsetHeight: img.offsetHeight,
      computedStyle: window.getComputedStyle(img),
    });
    setIsLoaded(true);
  };

  // Use native img tag for better control and to avoid Next.js Image wrapper issues
  // Ensure image fills the entire container
  const imageStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    minWidth: "100%",
    minHeight: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    objectPosition: "center",
    opacity: 1,
    display: "block",
    margin: 0,
    padding: 0,
    border: "none",
    boxSizing: "border-box",
  };
  
  // Merge passed style, but ensure critical sizing properties are preserved
  const finalStyle: React.CSSProperties = {
    ...imageStyle,
    ...style,
    // Force these critical properties to always be set
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
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: 2,
        overflow: "hidden",
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          margin: 0,
          padding: 0,
          border: "none",
        }}
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
    </div>
  );
}

export default CoverImg;
