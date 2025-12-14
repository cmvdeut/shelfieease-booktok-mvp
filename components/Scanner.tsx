"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  Html5QrcodeScannerState,
} from "html5-qrcode";

export function Scanner({ onDetected }: { onDetected: (code: string) => void }) {
  const regionId = useMemo(
    () => `qr-region-${Math.random().toString(16).slice(2)}`,
    []
  );

  const qrRef = useRef<Html5Qrcode | null>(null);
  const stoppingRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string>("");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  async function safeStop() {
    const qr = qrRef.current;
    if (!qr) return;
    if (stoppingRef.current) return;

    try {
      stoppingRef.current = true;
      const state = qr.getState?.();
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await qr.stop();
      }
    } catch {
      // ignore
    } finally {
      try {
        await qr.clear?.();
      } catch {}
      stoppingRef.current = false;
    }
  }

  async function trySetTorch(on: boolean) {
    const qr = qrRef.current;
    if (!qr) return false;
    try {
      // @ts-expect-error - torch constraint isn't in TypeScript lib types
      await qr.applyVideoConstraints({ advanced: [{ torch: on }] });
      return true;
    } catch {
      return false;
    }
  }

  async function start() {
    setError("");
    setStarted(false);

    try {
      const qr = new Html5Qrcode(regionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
        verbose: false,
      });
      qrRef.current = qr;

      await qr.start(
        { facingMode: "environment" },
        {
          fps: 8,
          qrbox: { width: 300, height: 120 },
          aspectRatio: 16 / 9,
          disableFlip: true,
        },
        async (decodedText) => {
          await safeStop();
          onDetected(decodedText.trim());
        },
        () => {}
      );

      setStarted(true);

      const supported = await trySetTorch(false);
      setTorchSupported(supported);
    } catch (e: any) {
      // In productie wil je dit zien
      const msg =
        typeof e?.message === "string"
          ? e.message
          : "Camera could not start. Check permission and try again.";
      setError(msg);
      setStarted(false);
    }
  }

  useEffect(() => {
    // Start automatisch bij mount (mobiel), maar toon error als het faalt
    start();

    return () => {
      safeStop();
      qrRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  async function toggleTorch() {
    const next = !torchOn;
    const ok = await trySetTorch(next);
    if (!ok) {
      setTorchSupported(false);
      setTorchOn(false);
      return;
    }
    setTorchOn(next);
  }

  return (
    <div>
      <div
        id={regionId}
        style={{
          width: "100%",
          height: 200,
          borderRadius: 16,
          overflow: "hidden",
          background: "#111",
          border: "1px solid #2a2a32",
        }}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            safeStop().then(() => start());
          }}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: 0,
            background: "#2a2a32",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Restart camera
        </button>

        {torchSupported && (
          <button
            onClick={toggleTorch}
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: 0,
              background: torchOn ? "#6d5efc" : "#2a2a32",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {torchOn ? "Flash off" : "Flash on"}
          </button>
        )}

        <span style={{ color: started ? "#b7b7b7" : "#8f8fa3", alignSelf: "center" }}>
          {started ? "Camera ready" : "Starting…"}
        </span>
      </div>

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 14,
            background: "#241616",
            border: "1px solid #5a2a2a",
            color: "#ffd0d0",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
