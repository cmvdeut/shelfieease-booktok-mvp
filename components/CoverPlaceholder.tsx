"use client";

import React from "react";

type CoverPlaceholderProps = {
  title: string;
  authors?: string[];
  isbn?: string;
  mood?: "aesthetic" | "bold" | "calm";
  style?: React.CSSProperties;
};

export function CoverPlaceholder({ title, authors = [], isbn, mood, style }: CoverPlaceholderProps) {
  // Use provided mood or detect from document
  const isCalm = mood === "calm" || (typeof document !== "undefined" && document.documentElement.dataset.mood === "calm");
  
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
    fontSize: 40,
    lineHeight: 1,
    marginBottom: 16,
    opacity: 0.8,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 980,
    textAlign: "center",
    color: isCalm ? "#4A3825" : "rgba(255,255,255,0.95)",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    lineHeight: 1.3,
    marginBottom: authors.length > 0 ? 10 : 0,
  };

  const authorStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    color: isCalm ? "rgba(74, 56, 37, 0.9)" : "rgba(255,255,255,0.85)",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    lineHeight: 1.2,
    marginBottom: isbn ? 8 : 0,
  };

  const isbnStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    color: isCalm ? "rgba(74, 56, 37, 0.7)" : "rgba(255,255,255,0.65)",
    fontFamily: "monospace",
    letterSpacing: 1,
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>📘</div>
      <div style={titleStyle}>
        {title || "Unknown"}
      </div>
      {authors.length > 0 && (
        <div style={authorStyle}>
          {authors.join(", ")}
        </div>
      )}
      {isbn && (
        <div style={isbnStyle}>
          ISBN {isbn}
        </div>
      )}
    </div>
  );
}

