"use client";

import Image from "next/image";

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
  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={400}
      style={style}
      onError={onError}
      unoptimized
    />
  );
}

export default CoverImg;
