"use client";

import React from "react";

type CoverPlaceholderProps = {
  title: string;
  style?: React.CSSProperties;
};

export function CoverPlaceholder({ title, style }: CoverPlaceholderProps) {
  // Detect mood for gradient background
  const isCalm = typeof document !== "undefined" && document.documentElement.dataset.mood === "calm";
  
  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    aspectRatio: "2 / 3",
    minHeight: 260,
    borderRadius: 18,
    background: isCalm
      ? "linear-gradient(135deg, rgba(156, 107, 47, 0.12), rgba(156, 107, 47, 0.06))"
      : "linear-gradient(135deg, rgba(109,94,252,0.15), rgba(255,73,240,0.10))",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    boxSizing: "border-box",
    border: isCalm
      ? "1px solid rgba(216, 198, 168, 0.3)"
      : "1px solid rgba(255,255,255,0.12)",
    ...style,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 48,
    lineHeight: 1,
    marginBottom: 12,
    opacity: 0.8,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 950,
    textAlign: "center",
    color: isCalm ? "#4A3825" : "rgba(255,255,255,0.9)",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    lineHeight: 1.3,
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>📘</div>
      <div style={titleStyle}>
        {title ? title.slice(0, 40) : "Unknown"}
      </div>
    </div>
  );
}

