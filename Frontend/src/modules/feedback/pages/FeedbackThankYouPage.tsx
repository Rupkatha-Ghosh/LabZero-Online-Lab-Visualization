import { useState, useEffect, useRef } from 'react';
import { Home, RotateCcw, Download } from 'lucide-react';

export interface FeedbackThankYouDetails {
  title?: string;
  message?: string;
  formTitle?: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

interface FeedbackThankYouPageProps {
  details?: FeedbackThankYouDetails;
  onBack?: () => void;
  onSubmitAnother?: () => void;
}

const floralMarks = [
  { className: 'left-[11%] top-[21%] rotate-[-18deg]', tone: 'rose' },
  { className: 'left-[30%] top-[8%] rotate-[14deg]', tone: 'mint' },
  { className: 'left-[47%] top-[35%] rotate-[-10deg]', tone: 'rose' },
  { className: 'right-[26%] top-[16%] rotate-[18deg]', tone: 'mint' },
  { className: 'right-[10%] top-[23%] rotate-[24deg]', tone: 'rose' },
  { className: 'right-[37%] bottom-[11%] rotate-[-20deg]', tone: 'mint' },
];

const DEFAULT_THANK_YOU_MESSAGE =
  'Your feedback has been submitted successfully.';

const TEAM_THANK_YOU_MESSAGE =
  'Thank you from the LabZero team for sharing your feedback with us. Your response helps us improve the learning experience for everyone.';

const TEAM_NAME = 'Script Kiddies';

const LabZeroBrand = () => (
  <div className="flex items-center justify-center gap-5">
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg
        viewBox="0 0 44 44"
        className="h-full w-full drop-shadow-[0_10px_22px_rgba(99,102,241,0.18)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M10 12 H34 L10 32 H34"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="22"
          cy="22"
          r="10"
          stroke="var(--color-primary)"
          strokeWidth="2.4"
          opacity="0.75"
        />
        <circle cx="10" cy="12" r="2.2" fill="var(--color-secondary)" />
        <circle cx="34" cy="32" r="2.2" fill="var(--color-primary)" />
      </svg>
      <div className="absolute inset-0 -z-10 rounded-full bg-[var(--color-primary)]/15 blur-xl" />
    </div>
    <p className="text-4xl font-black leading-none tracking-normal sm:text-5xl">
      <span className="text-[#0f172a]">LAB</span>
      <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
        ZERO
      </span>
    </p>
  </div>
);

const Flower = ({ className, tone }: { className: string; tone: string }) => (
  <span
    aria-hidden="true"
    className={`feedback-thanks-flower feedback-thanks-flower-${tone} absolute ${className}`}
  >
    <span />
    <span />
    <span />
    <span />
  </span>
);

const FeedbackThankYouPage = ({
  details,
  onBack,
  onSubmitAnother,
}: FeedbackThankYouPageProps) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadJpg = async () => {
    // Wait for page fonts to be fully loaded
    await document.fonts.ready;

    const W = 672, H = 600;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- Background ---
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // --- Project brand box ---
    const boxX = 96, boxY = 40, boxW = W - 192, boxH = 90, boxR = 36;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(boxX, boxY, boxW, boxH, boxR);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fillStyle = 'rgba(238, 242, 255, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 3;
    ctx.stroke();

    const logoX = W / 2 - 150;
    const logoY = boxY + 27;
    ctx.save();
    ctx.translate(logoX, logoY);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(36, 0);
    ctx.lineTo(0, 36);
    ctx.lineTo(36, 36);
    ctx.stroke();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(18, 18, 13, -0.2, Math.PI * 1.55);
    ctx.stroke();
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(36, 36, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const grad = ctx.createLinearGradient(W / 2 - 60, 0, W / 2 + 175, 0);
    grad.addColorStop(0, '#4f46e5');
    grad.addColorStop(0.5, '#a855f7');
    grad.addColorStop(1, '#ec4899');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 38px "Inter", "Sora", sans-serif';
    ctx.fillText('LAB', W / 2 - 98, boxY + 62);
    ctx.fillStyle = grad;
    ctx.fillText('ZERO', W / 2 - 23, boxY + 62);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '700 13px "Inter", "Sora", sans-serif';
    ctx.fillText(`Team ${TEAM_NAME}`, W / 2, boxY + 80);

    // --- Decorative vines ---
    const drawVine = (x: number, y: number, w: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.strokeStyle = 'rgba(31, 71, 54, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.stroke();
      // Leaves
      const drawLeaf = (lx: number, rot: number) => {
        ctx.save();
        ctx.translate(lx, -5);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.fillStyle = '#4f9a62';
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawLeaf(w * 0.18, -28);
      drawLeaf(w * 0.84, 38);
      ctx.restore();
    };
    drawVine(80, 240, 510, -2);
    drawVine(145, 290, 380, -4);

    // --- Decorative flowers ---
    const drawFlower = (cx: number, cy: number, rot: number, isRose: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      const petalAngles = [8, 88, 168, 248];
      for (const pa of petalAngles) {
        ctx.save();
        ctx.rotate((pa * Math.PI) / 180);
        ctx.translate(-2, -8);
        const pg = ctx.createLinearGradient(0, 0, 20, 14);
        if (isRose) {
          pg.addColorStop(0, '#fbd38d');
          pg.addColorStop(0.48, '#f97316');
          pg.addColorStop(1, '#be123c');
        } else {
          pg.addColorStop(0, '#d9f99d');
          pg.addColorStop(0.42, '#a7f3d0');
          pg.addColorStop(1, '#67e8f9');
        }
        ctx.fillStyle = pg;
        ctx.strokeStyle = 'rgba(45, 32, 38, 0.72)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(10, 7, 11, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    };
    drawFlower(110, 210, -18, true);
    drawFlower(240, 180, 14, false);
    drawFlower(350, 260, -10, true);
    drawFlower(460, 200, 18, false);
    drawFlower(550, 220, 24, true);
    drawFlower(400, 320, -20, false);

    // --- THANK YOU ---
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 86px "Sora", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THANK', W / 2, 260);
    ctx.fillText('YOU', W / 2, 335);

    // --- Subtitle text ---
    let yPos = 390;

    if (details?.title && details.title.toLowerCase() !== 'thank you') {
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 18px "Inter", "Sora", sans-serif';
      ctx.fillText(details.title, W / 2, yPos);
      yPos += 30;
    }

    // Message text with word-wrap
    ctx.fillStyle = '#475569';
    ctx.font = '400 14px "Inter", "Sora", sans-serif';
    const drawWrappedText = (text: string, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      for (const word of words) {
        const test = line + (line ? ' ' : '') + word;
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, W / 2, yPos);
          line = word;
          yPos += lineHeight;
        } else {
          line = test;
        }
      }
      if (line) {
        ctx.fillText(line, W / 2, yPos);
        yPos += lineHeight;
      }
    };

    const msgText = details?.message || DEFAULT_THANK_YOU_MESSAGE;
    const maxWidth = 460;
    drawWrappedText(msgText, maxWidth, 20);
    yPos += 8;

    ctx.fillStyle = '#334155';
    ctx.font = '600 14px "Inter", "Sora", sans-serif';
    drawWrappedText(TEAM_THANK_YOU_MESSAGE, maxWidth, 20);
    yPos += 8;

    // Form title badge
    if (details?.formTitle) {
      const badgeW = ctx.measureText(details.formTitle).width + 32;
      ctx.fillStyle = '#ecfdf5';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(W / 2 - badgeW / 2, yPos - 4, badgeW, 28, 12);
      } else {
        ctx.rect(W / 2 - badgeW / 2, yPos - 4, badgeW, 28);
      }
      ctx.fill();
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#065f46';
      ctx.font = '600 13px "Inter", "Sora", sans-serif';
      ctx.fillText(details.formTitle, W / 2, yPos + 16);
    }

    // --- Download ---
    const link = document.createElement('a');
    link.download = 'labzero-thank-you.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const message =
    details?.message ||
    DEFAULT_THANK_YOU_MESSAGE;

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-12 relative">
      {/* Download JPG button at the top right corner */}
      <div className="absolute top-6 right-6 z-40">
        <div className="relative">
          <button
            type="button"
            onClick={handleDownloadJpg}
            className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
          >
            <Download size={16} />
            Download JPG
          </button>
          {showTooltip && (
            <div className="absolute top-full right-0 mt-3.5 z-50 bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl border border-indigo-400 flex flex-col items-center gap-1 animate-bounce whitespace-nowrap">
              <div className="absolute bottom-full right-6 w-3 h-3 bg-indigo-600 border-l border-t border-indigo-400 rotate-45 -mt-1.5"></div>
              <div className="flex items-center gap-1.5">
                <span>📸</span>
                <span>Download your thank you page from here!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <section ref={cardRef} className="w-full text-center max-w-2xl mx-auto">

        <div className="mb-10 w-full flex flex-col items-center justify-center rounded-[32px] border border-indigo-100 bg-white/90 px-6 py-7 shadow-xl shadow-indigo-100/70">
          <LabZeroBrand />
        </div>

        <div className="relative mx-auto w-full max-w-3xl pb-3 pt-4">
          <div
            aria-hidden="true"
            className="feedback-thanks-vine left-[8%] top-[28%] w-[84%]"
          />
          <div
            aria-hidden="true"
            className="feedback-thanks-vine left-[20%] top-[50%] w-[62%] rotate-[-4deg]"
          />

          {floralMarks.map((flower) => (
            <Flower
              key={`${flower.tone}-${flower.className}`}
              className={flower.className}
              tone={flower.tone}
            />
          ))}

          <h1 className="feedback-thanks-heading relative mx-auto max-w-3xl text-[clamp(4rem,14vw,8rem)] font-black uppercase leading-[0.78] tracking-normal text-slate-900">
            <span className="block">Thank</span>
            <span className="block">You</span>
          </h1>
        </div>

        <div className="mx-auto mt-6 max-w-xl">
          {details?.title && details.title.toLowerCase() !== 'thank you' && (
            <p className="text-base font-bold text-slate-900">
              {details.title}
            </p>
          )}
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {message}
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
            {TEAM_THANK_YOU_MESSAGE}
          </p>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-indigo-600">
            Team {TEAM_NAME}
          </p>

          {details?.formTitle && (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              {details.formTitle}
            </p>
          )}

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
              >
                <Home size={16} />
                {details?.primaryActionLabel || 'Back to Home'}
              </button>
            )}
            {onSubmitAnother && (
              <button
                type="button"
                onClick={onSubmitAnother}
                className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                {details?.secondaryActionLabel || 'Submit another'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeedbackThankYouPage;
