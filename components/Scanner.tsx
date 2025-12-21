"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  Html5QrcodeScannerState,
} from "html5-qrcode";

export type ScannerProps = {
  onDetected: (code: string) => void;
};

export function Scanner({ onDetected }: ScannerProps) {
  const regionId = useMemo(() => `qr-region-${Math.random().toString(16).slice(2)}`, []);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const stoppingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function start() {
      if (!mounted || stoppingRef.current) return;

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
            if (!mounted) return;
            const text = decodedText.trim();
            try {
              const state = qr.getState?.();
              if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
                await qr.stop();
              }
            } catch {
              // ignore
            }
            onDetected(text);
          },
          () => {}
        );
      } catch (e: any) {
        console.error("Scanner error:", e);
      }
    }

    start();

    return () => {
      mounted = false;
      stoppingRef.current = true;
      const qr = qrRef.current;
      if (qr) {
        qr.stop().catch(() => {});
      }
      qrRef.current = null;
      stoppingRef.current = false;
    };
  }, [regionId, onDetected]);

  return (
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
  );
}

export default Scanner;

