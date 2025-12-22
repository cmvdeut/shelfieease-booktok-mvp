// DEBUG: onClose prop toegevoegd

"use client";

import React, { useEffect, useMemo, useRef } from "react";

export type ScannerProps = {
  onDetected: (code: string) => void;
  onClose?: () => void;
};

export function Scanner({ onDetected, onClose }: ScannerProps) {
  const regionId = useMemo(
    () => `qr-region-${Math.random().toString(16).slice(2)}`,
    []
  );

  const qrRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);

  // Stop/clear helper (veilig)
  const stopAndClear = async () => {
    const qr = qrRef.current;
    qrRef.current = null;

    if (!qr) return;

    try {
      await qr.stop();
    } catch {
      // ignore
    }

    try {
      qr.clear();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    async function start() {
      if (!mountedRef.current) return;
      if (startingRef.current) return;
      if (qrRef.current) return;

      startingRef.current = true;

      try {
        const mod = await import("html5-qrcode");
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = mod;

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
            if (!mountedRef.current) return;

            const text = decodedText.trim();

            // Stop camera asap, then callback
            await stopAndClear();
            onDetected(text);
          },
          () => {
            // onScanFailure: bewust leeg
          }
        );
      } catch (e) {
        console.error("Scanner error:", e);
        // Als start faalt, ruim op
        await stopAndClear();
      } finally {
        startingRef.current = false;
      }
    }

    void start();

    return () => {
      mountedRef.current = false;
      void stopAndClear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId, onDetected]);

  return (
    <div className="w-full">
      <div className="flex justify-end gap-2 mb-3">
        <button
          type="button"
          className="px-3 py-2 rounded-lg border text-sm"
          onClick={async () => {
            await stopAndClear();
            onClose?.();
          }}
        >
          Terug
        </button>
      </div>

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
    </div>
  );
}

export default Scanner;
