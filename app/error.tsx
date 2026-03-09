"use client";

import { useEffect } from "react";

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    if (error.message?.includes("Failed to load chunk")) {
      window.location.reload();
    }
  }, [error]);

  return null;
}
