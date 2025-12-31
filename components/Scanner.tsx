"use client";

import React, { useEffect, useRef } from "react";

export type ScannerProps = {
  onDetected: (code: string) => void;
  onClose?: () => void;
};

export function Scanner({ onDetected, onClose }: ScannerProps) {
  // Use useRef instead of useMemo to avoid hydration mismatch
  // Generate ID only once on client mount
  const regionIdRef = useRef<string | null>(null);
  if (typeof window !== "undefined" && !regionIdRef.current) {
    regionIdRef.current = `qr-region-${Math.random().toString(16).slice(2)}`;
  }
  const regionId = regionIdRef.current || "qr-region-placeholder";

  const qrRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

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

  // Set mobile state on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    async function start() {
      if (!mountedRef.current) return;
      if (startingRef.current) return;
      if (qrRef.current) return;
      if (typeof window === "undefined") return;
      if (!regionIdRef.current) return; // Wait for ID to be generated

      // Use containerRef instead of getElementById for better timing
      // Wait until containerRef is available
      let retries = 0;
      const maxRetries = 20; // Increased retries
      
      const waitForElement = (): Promise<HTMLElement | null> => {
        return new Promise((resolve) => {
          const element = containerRef.current || document.getElementById(regionId);
          if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
            resolve(element);
          } else if (retries < maxRetries && mountedRef.current) {
            retries++;
            setTimeout(() => resolve(waitForElement()), 100);
          } else {
            resolve(null);
          }
        });
      };

      const element = await waitForElement();
      if (!element) {
        console.error(`Scanner: Element with id=${regionId} not found after ${maxRetries} retries`);
        return;
      }

      startingRef.current = true;

      try {
        const mod = await import("html5-qrcode");
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = mod;

        // Use the actual element ID
        const actualRegionId = regionIdRef.current;
        const qr = new Html5Qrcode(actualRegionId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
          verbose: false,
        });

        qrRef.current = qr;

        // Detect if mobile device for better scanning config
        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);
        
        // Get container dimensions for better qrbox sizing
        const container = element;
        const containerWidth = container.clientWidth || 300;
        const containerHeight = container.clientHeight || 200;
        
        await qr.start(
          { facingMode: "environment" },
          {
            fps: isMobileDevice ? 10 : 8, // Slightly lower FPS for better quality per frame
            // Optimized scan area for better focus
            qrbox: isAndroid
              ? { width: Math.min(containerWidth * 0.85, 350), height: Math.min(containerHeight * 0.85, 300) }
              : isMobileDevice
              ? { width: 250, height: 250 }
              : { width: 300, height: 120 },
            aspectRatio: isMobileDevice ? 1.0 : 16 / 9,
            disableFlip: false, // Allow rotation for better detection on all angles
            
            videoConstraints: {
              facingMode: "environment",
              width: { ideal: isAndroid ? 1280 : 1280 },
              height: { ideal: isAndroid ? 720 : 720 },
              
            } as any,
            // Additional options for better Android detection
            ...(isAndroid && {
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: true,
              } as any,
            }),
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
      } catch (e: any) {
        const errorMsg = e?.message || String(e);
        // Only log errors that aren't about element not found (we handle that above)
        if (!errorMsg.includes("not found") && !errorMsg.includes("Element with id")) {
          console.error("Scanner error:", errorMsg);
          
          // Als het een camera/media error is, log dit specifiek
          if (errorMsg.includes("userMedia") || errorMsg.includes("NotReadableError") || errorMsg.includes("video source")) {
            console.error("Camera access error - device may be in use or permissions denied");
          }
        }
        
        // Als start faalt, ruim op
        await stopAndClear();
      } finally {
        startingRef.current = false;
      }
    }

    // Start met delay om zeker te zijn dat DOM gereed is en regionId is gegenereerd
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && regionIdRef.current) {
        void start();
      }
    }, 300); // Increased delay for better reliability

    return () => {
      clearTimeout(timeoutId);
      mountedRef.current = false;
      void stopAndClear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDetected]); // regionId is now stable via ref, no need in deps

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
        ref={containerRef}
        id={regionId}
        style={{
          width: "100%",
          height: isMobile ? 400 : 200, // Use state instead of navigator check
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
