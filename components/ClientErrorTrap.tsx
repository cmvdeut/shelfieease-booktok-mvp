"use client";

import { useEffect } from "react";

export function ClientErrorTrap() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      try {
        const errorInfo = [
          `Error: ${event.message || "Unknown error"}`,
          `File: ${event.filename || "unknown"}`,
          `Line: ${event.lineno || "unknown"}`,
          `Column: ${event.colno || "unknown"}`,
          event.error?.stack ? `Stack:\n${event.error.stack}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        sessionStorage.setItem("__last_client_error", errorInfo);
      } catch {
        // ignore storage errors
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        const reason = event.reason;
        const errorInfo = [
          `Unhandled Promise Rejection: ${reason?.message || String(reason)}`,
          reason?.stack ? `Stack:\n${reason.stack}` : "",
        ]
          .filter(Boolean)
          .join("\n");

        sessionStorage.setItem("__last_client_error", errorInfo);
      } catch {
        // ignore storage errors
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}




