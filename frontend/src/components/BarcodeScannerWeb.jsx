// components/BarcodeScannerWeb.jsx
import React, { useEffect, useRef } from "react";

// This component uses html5-qrcode package.
// Make sure you installed it: npm install html5-qrcode
// If you prefer not to use camera, you can switch to manual barcode input instead.
export default function BarcodeScannerWeb({ onDetected, fps = 10 }) {
  const divId = "html5qr-scanner";
  const scannerRef = useRef(null);

  useEffect(() => {
    let Html5Qrcode;
    let scanner;
    let started = false;

    (async () => {
      try {
        const mod = await import("html5-qrcode");
        Html5Qrcode = mod.Html5Qrcode;
        scanner = new Html5Qrcode(divId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps },
          (decodedText) => {
            if (!started) started = true;
            onDetected(decodedText);
            // Optionally stop scanner after successful detection:
            // scanner.stop().catch(()=>{});
          },
          (error) => {
            // optional error callback per scan
            // console.debug("scan error", error);
          }
        );
      } catch (err) {
        console.error("Scanner init failed:", err);
      }
    })();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={divId} style={{ width: "100%" }} />;
}
