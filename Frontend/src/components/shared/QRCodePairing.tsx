import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";

type QRCodePairingProps = {
  pairingUrl: string;
  copyStatus?: "idle" | "copied";
  onCopy?: () => void;
};

export default function QRCodePairing({
  pairingUrl,
  copyStatus = "idle",
  onCopy,
}: QRCodePairingProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-center rounded-xl border border-white/10 bg-white p-3">
        <QRCodeSVG value={pairingUrl} size={160} />
      </div>

      <button
        onClick={onCopy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-indigo-500"
      >
        <Copy size={12} />
        {copyStatus === "copied" ? "Copied" : "Copy Link"}
      </button>

      <p className="break-all rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[10px] leading-relaxed text-slate-500">
        {pairingUrl}
      </p>
    </div>
  );
}
