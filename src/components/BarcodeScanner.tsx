import { useEffect, useRef, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (code: string) => void;
}

const SCANNER_ID = "clowthex-qr-region";

export function BarcodeScanner({ open, onOpenChange, onDetected }: Props) {
  const { t } = useApp();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        const s = scannerRef.current;
        scannerRef.current = null;
        const state = s.getState();
        if (state === 2 || state === 3) await s.stop();
        s.clear();
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!open) {
      stopScanner();
      setStatus("loading");
      setErrorMsg("");
      return;
    }

    let alive = true;

    (async () => {
      await new Promise((r) => setTimeout(r, 400));
      if (!alive) return;

      try {
        const scanner = new Html5Qrcode(SCANNER_ID, { verbose: false });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 160 }, aspectRatio: 1.77 },
          (text) => {
            if (!alive) return;
            stopScanner().then(() => {
              onDetected(text);
              onOpenChange(false);
            });
          },
          () => {}
        );

        if (alive) setStatus("scanning");
      } catch (err: any) {
        if (!alive) return;
        setStatus("error");
        const msg = String(err?.message ?? err);
        if (/NotAllowed|Permission|permission/i.test(msg)) {
          setErrorMsg("❌ لا يمكن الوصول إلى الكاميرا\nاذهب: إعدادات ← التطبيقات ← ClowtheX ← الأذونات ← فعّل الكاميرا");
        } else if (/NotFound|not found|Devices/i.test(msg)) {
          setErrorMsg("❌ لم يتم العثور على كاميرا");
        } else if (/NotReadable|Could not start/i.test(msg)) {
          setErrorMsg("❌ الكاميرا مستخدمة من تطبيق آخر\nأغلق التطبيقات وأعد المحاولة");
        } else {
          setErrorMsg("❌ خطأ: " + msg);
        }
      }
    })();

    return () => { alive = false; stopScanner(); };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#000" }}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "#111" }}>
        <span className="text-white font-semibold text-base">{t.scanner.title}</span>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20"
          onClick={() => { stopScanner(); onOpenChange(false); }}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden" style={{ background: "#000" }}>

        <div id={SCANNER_ID} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          opacity: status === "scanning" ? 1 : 0, pointerEvents: "none",
        }} />

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: "#000" }}>
            <Camera className="w-16 h-16 text-white animate-pulse" />
            <p className="text-white text-sm">جاري تشغيل الكاميرا...</p>
          </div>
        )}

        {status === "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <div className="relative w-64 h-44">
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-lg" />
              <div className="absolute inset-x-2 h-0.5 bg-yellow-400 rounded" style={{ animation: "scanline 2s ease-in-out infinite" }} />
            </div>
            <p className="text-white text-sm bg-black/70 px-4 py-2 rounded-full">{t.scanner.hint}</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8" style={{ background: "#000" }}>
            <p className="text-white text-sm bg-red-900/90 px-5 py-4 rounded-2xl text-center leading-relaxed whitespace-pre-line">{errorMsg}</p>
            <Button variant="outline" className="text-white border-white/40 hover:bg-white/10"
              onClick={() => { stopScanner(); onOpenChange(false); }}>
              إغلاق
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scanline { 0% { top: 4px; } 50% { top: calc(100% - 4px); } 100% { top: 4px; } }
        #${SCANNER_ID} > * { display: none !important; }
        #${SCANNER_ID} video {
          display: block !important; position: absolute !important;
          inset: 0 !important; width: 100% !important;
          height: 100% !important; object-fit: cover !important;
        }
      `}</style>
    </div>
  );
}
