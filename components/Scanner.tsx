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

  useEffect(() => {
    let cancelled = false;

    (async () => {
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
            if (cancelled) return;
            await safeStop();
            onDetected(decodedText.trim());
          },
          () => {}
        );

        const supported = await trySetTorch(false);
        if (!cancelled) setTorchSupported(supported);
      } catch {
        // silent fail; scan page can still show manual entry
      }
    })();

    return () => {
      cancelled = true;
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

      {torchSupported && (
        <button
          onClick={toggleTorch}
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 14,
            border: 0,
            background: torchOn ? "#6d5efc" : "#2a2a32",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {torchOn ? "Flash off" : "Flash on"}
        </button>
      )}
    </div>
  );
}
