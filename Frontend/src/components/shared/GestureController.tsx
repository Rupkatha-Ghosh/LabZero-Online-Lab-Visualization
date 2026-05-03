import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { GestureRecognizer } from '@mediapipe/tasks-vision';
import { getGestureRecognizer } from '../../services/gestureService';
import {
  Hand, Camera, CheckCircle2, XCircle,
  ChevronRight, ChevronLeft, RotateCw, MousePointer2,
  MessageSquare, Bookmark, ZoomIn, BookOpen, X,
} from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface GestureControllerProps {
  /** Thumb Up hold 0.6 s → confirm / click element under cursor */
  onSelect?: () => void;
  /** Thumb Down hold → back / reject */
  onBack?: () => void;
  /** Open Palm static → raise hand signal */
  onRaiseHand?: () => void;
  /** Open Palm moving vertically → scroll */
  onScroll?: (delta: number) => void;
  /** Open Palm fast swipe right → next slide */
  onNextSlide?: () => void;
  /** Open Palm fast swipe left → previous slide */
  onPrevSlide?: () => void;
  /** Closed Fist moving → grab & rotate 3-D */
  onRotate?: (dx: number, dy: number) => void;
  /** Pointing Up → laser pointer position */
  onLaserPointer?: (pos: { x: number; y: number } | null) => void;
  /** Pointing Up moving → annotate / draw */
  onAnnotate?: (pos: { x: number; y: number } | null) => void;
  /** Victory hold 1 s → toggle AI Tutor */
  onToggleTheme?: () => void;
  /** Reset Zoom gesture */
  onResetZoom?: () => void;
  /** Pinch (landmark-based) → zoom delta */
  onZoom?: (delta: number) => void;
  /** Raw hand position for any overlay consumer */
  onPositionChange?: (pos: { x: number; y: number } | null) => void;
  isActive: boolean;
  onToggle: () => void;
}

interface TrailPoint { x: number; y: number; id: number }
interface SwipeSample { x: number; t: number }

// ─────────────────────────────────────────────────────────────────────────────
// Gesture catalogue — matches the reference table exactly
// ─────────────────────────────────────────────────────────────────────────────
const GESTURE_DEFS = [
  {
    id: 'Thumb_Up',
    emoji: '👍',
    label: 'Confirm',
    sublabel: 'Hold 0.6 s',
    action: 'Confirm / Select',
    useCase: 'Approve answers, click buttons',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.55)',
    holdMs: 600,
    icon: CheckCircle2,
    mode: 'SELECT',
  },
  {
    id: 'Thumb_Down',
    emoji: '👎',
    label: 'Back',
    sublabel: 'Hold 0.6 s',
    action: 'Back / Reject',
    useCase: 'Go back to previous content',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.55)',
    holdMs: 600,
    icon: XCircle,
    mode: 'BACK',
  },
  {
    id: 'Open_Palm',
    emoji: '✋',
    label: 'Raise Hand',
    sublabel: 'Static / scroll',
    action: 'Raise Hand / Scroll',
    useCase: 'Ask questions, browse content',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.55)',
    holdMs: null,
    icon: Hand,
    mode: 'SCROLL',
  },
  {
    id: 'Palm_Swipe',
    emoji: '🤚',
    label: 'Slide',
    sublabel: 'Swipe →/←',
    action: 'Next / Prev Slide',
    useCase: 'Presentation control',
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.55)',
    holdMs: null,
    icon: ChevronRight,
    mode: 'SWIPE',
  },
  {
    id: 'Closed_Fist',
    emoji: '✊',
    label: 'Grab',
    sublabel: 'Move hand',
    action: 'Grab & Rotate / Pause',
    useCase: 'Manipulate 3-D models',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.55)',
    holdMs: null,
    icon: RotateCw,
    mode: 'ROTATE',
  },
  {
    id: 'Pointing_Up',
    emoji: '☝️',
    label: 'Pointer',
    sublabel: 'Move to aim',
    action: 'Laser Pointer / Draw',
    useCase: 'Focus attention, annotate',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.55)',
    holdMs: null,
    icon: MousePointer2,
    mode: 'POINTER',
  },
  {
    id: 'Victory',
    emoji: '✌️',
    label: 'Theme',
    sublabel: 'Hold 1 s',
    action: 'Toggle Theme',
    useCase: 'Switch between light and dark mode',
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.55)',
    holdMs: 1000,
    icon: MessageSquare,
    mode: 'AI',
  },
  {
    id: 'ILoveYou',
    emoji: '🤙',
    label: 'Reset',
    sublabel: 'Hold 1 s',
    action: 'Reset Zoom',
    useCase: 'Return to original view slowly',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.55)',
    holdMs: 1000,
    icon: RotateCw,
    mode: 'RESET',
  },
  {
    id: 'Pinch',
    emoji: '🤏',
    label: 'Zoom',
    sublabel: 'Open / close',
    action: 'Zoom In / Out',
    useCase: 'Examine diagrams closely',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.55)',
    holdMs: null,
    icon: ZoomIn,
    mode: 'ZOOM',
  },
] as const;

type GestureId = (typeof GESTURE_DEFS)[number]['id'] | 'None';

// ─────────────────────────────────────────────────────────────────────────────
// Hold-progress SVG ring
// ─────────────────────────────────────────────────────────────────────────────
const HoldRing: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
        strokeLinecap="round"
        style={{ opacity: progress > 0 ? 1 : 0, transition: 'stroke-dashoffset 0.05s linear' }} />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Spring-animated confidence bar
// ─────────────────────────────────────────────────────────────────────────────
const ConfBar: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  const sp = useSpring(value, { stiffness: 180, damping: 22 });
  const w = useTransform(sp, [0, 1], ['0%', '100%']);
  useEffect(() => { sp.set(value); }, [value, sp]);
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
      <motion.div className="h-full rounded-full" style={{ width: w, background: color, boxShadow: `0 0 6px ${color}` }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Fading hand-trail dots inside the mini viewport
// ─────────────────────────────────────────────────────────────────────────────
const Trail: React.FC<{ points: TrailPoint[]; color: string }> = ({ points, color }) => (
  <>
    {points.map((p, i) => (
      <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
        style={{
          left: `${p.x * 100}%`, top: `${p.y * 100}%`,
          transform: 'translate(-50%,-50%)',
          width: 5, height: 5,
          background: color,
          opacity: (i + 1) / points.length * 0.75,
        }}
        initial={{ scale: 1 }} animate={{ scale: 0.2, opacity: 0 }}
        transition={{ duration: 0.5 }} />
    ))}
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Gesture cheat-sheet panel  (matches the reference table layout)
// ─────────────────────────────────────────────────────────────────────────────
const GestureGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 16, scale: 0.96 }}
    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    className="absolute bottom-full mb-4 left-0 z-50"
    style={{
      width: 520,
      background: 'rgba(2,6,23,0.98)',
      border: '1px solid rgba(99,102,241,0.22)',
      borderRadius: 20,
      padding: 20,
      backdropFilter: 'blur(24px)',
      boxShadow: '0 0 60px rgba(99,102,241,0.12), 0 32px 64px rgba(0,0,0,0.7)',
    }}>
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <BookOpen size={13} style={{ color: '#818cf8' }} />
        <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#818cf8', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          Gesture Reference
        </span>
      </div>
      <button onClick={onClose}
        className="w-6 h-6 rounded-lg flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}>
        <X size={11} />
      </button>
    </div>

    {/* Table header */}
    <div className="grid mb-2 px-3" style={{ gridTemplateColumns: '2fr 1.4fr 2fr' }}>
      {['Gesture', 'Action', 'Use Case'].map(h => (
        <span key={h} style={{ fontFamily: 'monospace', fontSize: 8, color: '#334155', letterSpacing: '0.22em', textTransform: 'uppercase' }}>{h}</span>
      ))}
    </div>

    {/* Rows */}
    <div className="grid gap-1.5">
      {GESTURE_DEFS.map((g) => {
        const Icon = g.icon;
        return (
          <div key={g.id} className="grid items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ gridTemplateColumns: '2fr 1.4fr 2fr', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
            {/* Gesture cell */}
            <div className="flex items-center gap-2.5">
              <span style={{ fontSize: 17 }}>{g.emoji}</span>
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: g.color, fontWeight: 700, display: 'block' }}>{g.label}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#334155' }}>{g.sublabel}</span>
              </div>
            </div>
            {/* Action cell */}
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${g.color}15` }}>
                <Icon size={10} style={{ color: g.color }} />
              </div>
              <span style={{ fontSize: 9.5, color: '#94a3b8' }}>{g.action}</span>
            </div>
            {/* Use case cell */}
            <span style={{ fontSize: 9, color: '#475569', lineHeight: 1.5 }}>{g.useCase}</span>
          </div>
        );
      })}
    </div>

    {/* Tip */}
    <div className="mt-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.14)' }}>
      <p style={{ fontFamily: 'monospace', fontSize: 8, color: '#475569', letterSpacing: '0.08em', lineHeight: 1.7 }}>
        💡 Hold gestures fill the ring before firing · Swipe = fast horizontal palm &gt; 0.6 u/s · Pinch = bring thumb + index tip close together
      </p>
    </div>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────────────────────────────────────────
const GestureToast: React.FC<{ gestureId: GestureId | null }> = ({ gestureId }) => {
  const def = GESTURE_DEFS.find(g => g.id === gestureId);
  return (
    <AnimatePresence>
      {def && (
        <motion.div key={gestureId}
          className="fixed top-8 left-1/2 z-[300] flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{
            background: 'rgba(2,6,23,0.97)',
            border: `1px solid ${def.color}45`,
            boxShadow: `0 0 40px ${def.glow}, 0 20px 40px rgba(0,0,0,0.6)`,
            backdropFilter: 'blur(22px)',
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, y: -28, scale: 0.86 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 480, damping: 30 }}>
          <motion.span style={{ fontSize: 26 }}
            animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 0.38 }}>
            {def.emoji}
          </motion.span>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 8, color: def.color, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 2 }}>
              {def.mode}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#f1f5f9', fontWeight: 700 }}>
              {def.action}
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{def.useCase}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const GestureController: React.FC<GestureControllerProps> = ({
  onSelect, onBack, onRaiseHand, onScroll,
  onNextSlide, onPrevSlide, onRotate,
  onLaserPointer, onAnnotate,
  onToggleTheme, onResetZoom, onZoom,
  onPositionChange, isActive, onToggle,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const gestureRecRef = useRef<GestureRecognizer | null>(null);

  // Non-state refs (no re-render needed)
  const lastVideoTimeRef = useRef(-1);
  const lastProcTimeRef = useRef(0);
  const lastHandPosRef = useRef<{ x: number; y: number } | null>(null);
  const trailIdRef = useRef(0);
  const holdStateRef = useRef<Record<string, { startMs: number; fired: boolean }>>({});
  const swipeBufRef = useRef<SwipeSample[]>([]);
  const lastSwipeTimeRef = useRef(0);
  const lastPinchDistRef = useRef<number | null>(null);
  const raiseHandFiredRef = useRef(false);

  const TARGET_FPS = 60;
  const FRAME_INTERVAL = 1000 / TARGET_FPS;
  const SMOOTH = 0.45;
  const SAFE = 0.05;
  const PINCH_THRESHOLD = 0.07;   // normalised landmark units
  const SWIPE_VEL_THRESHOLD = 0.55;   // units / second
  const SWIPE_DEBOUNCE = 800;    // ms between swipes

  // UI state
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureId>('None');
  const [confidence, setConfidence] = useState(0);
  const [handPosition, setHandPosition] = useState<{ x: number; y: number } | null>(null);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [activeMode, setActiveMode] = useState('IDLE');
  const [justFired, setJustFired] = useState<GestureId | null>(null);
  const [holdProgress, setHoldProgress] = useState<Record<string, number>>({});
  const [fps, setFps] = useState(0);
  const fpsRef = useRef({ n: 0, last: Date.now() });

  // ── Init recognizer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;

    // Suppress technical TFLite info logs that look like errors
    const originalInfo = console.info;
    const originalLog = console.log;
    console.info = (...args) => {
      const msg = args[0];
      if (typeof msg === 'string' && (msg.includes('TensorFlow Lite') || msg.includes('XNNPACK'))) return;
      originalInfo(...args);
    };
    console.log = (...args) => {
      const msg = args[0];
      if (typeof msg === 'string' && (msg.includes('Created TensorFlow Lite') || msg.includes('XNNPACK'))) return;
      originalLog(...args);
    };

    if (!gestureRecRef.current) {
      getGestureRecognizer()
        .then(r => { gestureRecRef.current = r; setIsLoaded(true); })
        .catch(e => console.error('GestureRecognizer init failed:', e));
    }

    return () => {
      console.info = originalInfo;
      console.log = originalLog;
    };
  }, [isActive]);

  // ── Camera + prediction loop ─────────────────────────────────────────────
  useEffect(() => {
    let stream: MediaStream | null = null;
    let alive = true;
    let raf: number;

    const fire = (id: GestureId) => {
      setJustFired(id);
      setTimeout(() => setJustFired(null), 900);
    };

    const loop = () => {
      if (!alive || !videoRef.current || !gestureRecRef.current) return;

      const now = Date.now();

      // FPS counter
      fpsRef.current.n++;
      if (now - fpsRef.current.last >= 1000) {
        setFps(fpsRef.current.n);
        fpsRef.current = { n: 0, last: now };
      }

      if (now - lastProcTimeRef.current < FRAME_INTERVAL - 1) { raf = requestAnimationFrame(loop); return; }

      const vid = videoRef.current;
      if (vid.currentTime !== lastVideoTimeRef.current && vid.videoWidth > 0) {
        lastVideoTimeRef.current = vid.currentTime;
        lastProcTimeRef.current = now;

        try {
          const res = gestureRecRef.current.recognizeForVideo(vid, now);

          if (res.gestures.length > 0) {
            const top = res.gestures[0][0];
            const rawGesture = top.categoryName as GestureId;
            const conf = top.score ?? 0;
            const lm = res.landmarks[0];
            const indexTip = lm[8];
            const thumbTip = lm[4];

            const pinchDist = Math.hypot(
              (1 - thumbTip.x) - (1 - indexTip.x),
              thumbTip.y - indexTip.y,
            );
            const isPinching = pinchDist < PINCH_THRESHOLD;
            const gesture: GestureId = isPinching ? 'Pinch' : rawGesture;
            const trackingPoint =
              gesture === 'Closed_Fist'
                ? (lm[9] ?? lm[0])
                : gesture === 'Pinch'
                  ? {
                    x: (thumbTip.x + indexTip.x) / 2,
                    y: (thumbTip.y + indexTip.y) / 2,
                  }
                  : indexTip;

            // Safe-area guard
            if (trackingPoint.x < SAFE || trackingPoint.x > 1 - SAFE ||
              trackingPoint.y < SAFE || trackingPoint.y > 1 - SAFE) {
              raf = requestAnimationFrame(loop); return;
            }

            // Smoothed, mirrored position
            const rawX = 1 - trackingPoint.x;
            const rawY = trackingPoint.y;
            const prev = lastHandPosRef.current;
            const sx = prev ? prev.x + (rawX - prev.x) * SMOOTH : rawX;
            const sy = prev ? prev.y + (rawY - prev.y) * SMOOTH : rawY;
            const pos = { x: sx, y: sy };

            setCurrentGesture(gesture);
            setConfidence(conf);
            setHandPosition(pos);
            onPositionChange?.(pos);

            // Trail
            setTrail(t => [...t, { x: sx, y: sy, id: trailIdRef.current++ }].slice(-14));

            // ── Hold-gesture bookkeeping ──────────────────────────────────
            const holdDef = GESTURE_DEFS.find(g => g.id === gesture && g.holdMs !== null);

            if (holdDef && holdDef.holdMs !== null) {
              if (!holdStateRef.current[gesture]) {
                holdStateRef.current = {};                          // reset others
                holdStateRef.current[gesture] = { startMs: now, fired: false };
              }
              const held = now - holdStateRef.current[gesture].startMs;
              const progress = Math.min(held / holdDef.holdMs, 1);
              setHoldProgress({ [gesture]: progress });

              if (!holdStateRef.current[gesture].fired && held >= holdDef.holdMs) {
                holdStateRef.current[gesture].fired = true;
                fire(gesture);
                setActiveMode(holdDef.mode);

                switch (gesture) {
                  case 'Thumb_Up': {
                    const ex = pos.x * window.innerWidth;
                    const ey = pos.y * window.innerHeight;
                    (document.elementFromPoint(ex, ey) as HTMLElement | null)?.click();
                    onSelect?.();
                    break;
                  }
                  case 'Thumb_Down': onBack?.(); break;
                  case 'Victory': onToggleTheme?.(); break;
                  case 'ILoveYou': onResetZoom?.(); break;
                }
              }
            } else {
              // Different gesture — reset hold state
              if (Object.keys(holdStateRef.current).some(k => k !== gesture)) {
                holdStateRef.current = {};
                setHoldProgress({});
              }
            }

            // ── Continuous / immediate gestures ──────────────────────────
            if (gesture === 'Pointing_Up') {
              setActiveMode('POINTER');
              onLaserPointer?.(pos);
              if (prev) {
                const dx = pos.x - prev.x, dy = pos.y - prev.y;
                if (Math.abs(dx) > 0.003 || Math.abs(dy) > 0.003) onAnnotate?.(pos);
              }

            } else if (gesture === 'Open_Palm') {
              setActiveMode('SCROLL');

              // One-shot raise-hand on first frame of this gesture
              if (!raiseHandFiredRef.current) {
                raiseHandFiredRef.current = true;
                onRaiseHand?.();
              }

              // Vertical scroll
              if (prev) {
                const dy = pos.y - prev.y;
                if (Math.abs(dy) > 0.007) onScroll?.(dy * 2200);
              }

              // Swipe detection — sliding window of x-positions
              swipeBufRef.current.push({ x: sx, t: now });
              swipeBufRef.current = swipeBufRef.current.filter(s => now - s.t < 350);

              if (swipeBufRef.current.length >= 4 && now - lastSwipeTimeRef.current > SWIPE_DEBOUNCE) {
                const first = swipeBufRef.current[0];
                const last = swipeBufRef.current[swipeBufRef.current.length - 1];
                const dt = (last.t - first.t) / 1000;
                const vel = dt > 0 ? (last.x - first.x) / dt : 0;

                if (Math.abs(vel) > SWIPE_VEL_THRESHOLD) {
                  lastSwipeTimeRef.current = now;
                  swipeBufRef.current = [];
                  fire('Palm_Swipe');
                  setActiveMode('SWIPE');
                  vel > 0 ? onNextSlide?.() : onPrevSlide?.();
                }
              }

            } else if (gesture === 'Closed_Fist') {
              setActiveMode('ROTATE');
              if (prev) {
                const dx = pos.x - prev.x, dy = pos.y - prev.y;
                if (Math.abs(dx) > 0.005 || Math.abs(dy) > 0.005) onRotate?.(dx * 400, dy * 400);
              }

            } else if (gesture === 'Pinch') {
              setActiveMode('ZOOM');
              if (lastPinchDistRef.current !== null) {
                const delta = pinchDist - lastPinchDistRef.current;
                if (Math.abs(delta) > 0.003) onZoom?.(delta * 500);
              }

            } else {
              // Gesture that is none of the above — clear continuous states
              onLaserPointer?.(null);
              swipeBufRef.current = [];
              raiseHandFiredRef.current = false;
            }

            lastPinchDistRef.current = isPinching ? pinchDist : null;
            lastHandPosRef.current = pos;

          } else {
            // No hand
            setCurrentGesture('None');
            setConfidence(0);
            setHandPosition(null);
            setActiveMode('IDLE');
            setTrail([]);
            setHoldProgress({});
            holdStateRef.current = {};
            swipeBufRef.current = [];
            raiseHandFiredRef.current = false;
            lastHandPosRef.current = null;
            lastPinchDistRef.current = null;
            onPositionChange?.(null);
            onLaserPointer?.(null);
          }
        } catch (e) { console.error('Recognition error', e); }
      }

      if (alive) raf = requestAnimationFrame(loop);
    };

    const startCamera = async () => {
      if (!isActive || !videoRef.current) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, frameRate: { ideal: TARGET_FPS } },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', loop);
      } catch (e) { console.error('Camera error', e); }
    };

    if (isActive) startCamera();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [isActive, onSelect, onBack, onRaiseHand, onScroll, onNextSlide, onPrevSlide,
    onRotate, onLaserPointer, onAnnotate, onToggleTheme, onResetZoom, onZoom]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeDef = GESTURE_DEFS.find(g => g.id === currentGesture);
  const activeColor = activeDef?.color ?? '#6366f1';
  const activeGlow = activeDef?.glow ?? 'rgba(99,102,241,0.5)';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Global laser pointer ────────────────────────────────────────── */}
      <AnimatePresence>
        {isActive && handPosition && activeMode === 'POINTER' && (
          <motion.div className="fixed pointer-events-none z-[200]"
            style={{ left: handPosition.x * window.innerWidth, top: handPosition.y * window.innerHeight }}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', background: '#06b6d4',
              boxShadow: '0 0 0 4px rgba(6,182,212,0.25), 0 0 22px rgba(6,182,212,0.8)',
              transform: 'translate(-50%,-50%)', position: 'absolute',
            }} />
            <motion.div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '1px solid rgba(6,182,212,0.4)',
              transform: 'translate(-50%,-50%)', position: 'absolute',
            }}
              animate={{ scale: [1, 1.55, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.4, repeat: Infinity }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <GestureToast gestureId={justFired} />

      {/* ── HUD bar ───────────────────────────────────────────────────────── */}
      <div className={`fixed left-4 md:left-4 z-[100] transition-all duration-500 ${isActive ? 'bottom-24 md:bottom-32' : 'bottom-20'}`}>

        <AnimatePresence>
          {showGuide && <GestureGuide onClose={() => setShowGuide(false)} />}
        </AnimatePresence>

        <motion.div layout className="relative flex items-center gap-3 rounded-2xl overflow-hidden"
          style={{
            padding: isActive ? '10px 14px' : '8px',
            background: isActive ? 'rgba(2,6,23,0.97)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isActive ? activeColor + '42' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: isActive
              ? `0 0 60px ${activeGlow}22, 0 0 0 1px ${activeColor}12, 0 24px 56px rgba(0,0,0,0.78)`
              : 'none',
            backdropFilter: 'blur(24px)',
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}>

          {/* Ambient glow breathe */}
          {isActive && (
            <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(ellipse at 15% 50%, ${activeColor}07 0%, transparent 65%)` }}
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.8, repeat: Infinity }} />
          )}

          {/* ── Toggle button ─────────────────────────────────────────────── */}
          <motion.button onClick={onToggle}
            className="relative hidden md:flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0"
            style={{
              width: 52, height: 52,
              background: isActive ? activeColor : 'rgba(255,255,255,0.05)',
              boxShadow: isActive ? `0 0 18px ${activeGlow}` : 'none',
            }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}>
            <motion.div animate={{ rotate: isActive ? 360 : 0 }} transition={{ duration: 0.5 }}>
              {isActive ? <Hand size={22} color="#fff" /> : <Camera size={22} style={{ color: '#64748b' }} />}
            </motion.div>
            {isActive && (
              <motion.div className="absolute inset-0 rounded-xl"
                style={{ border: `2px solid ${activeColor}` }}
                animate={{ opacity: [0.3, 0.85, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }} />
            )}
          </motion.button>

          {/* ── Expanded panel ────────────────────────────────────────────── */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="flex items-center gap-4 overflow-hidden">

                <div className="h-10 w-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />

                {/* Status block */}
                <div className="flex-shrink-0" style={{ minWidth: 110 }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: activeColor }}
                      animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.1, repeat: Infinity }} />
                    <span style={{ fontFamily: 'monospace', fontSize: 8, color: '#475569', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                      {fps}fps · {isLoaded ? 'LIVE' : 'INIT…'}
                    </span>
                  </div>
                  <motion.div key={currentGesture}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
                    <span style={{
                      fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                      color: currentGesture !== 'None' ? activeColor : '#1e293b',
                      letterSpacing: '0.04em', display: 'block', marginBottom: 4,
                    }}>
                      {currentGesture === 'None' ? 'SCANNING…' : currentGesture.replace(/_/g, ' ')}
                    </span>
                  </motion.div>
                  <ConfBar value={confidence} color={activeColor} />
                  <div style={{ fontFamily: 'monospace', fontSize: 7.5, color: '#334155', marginTop: 3, letterSpacing: '0.1em' }}>
                    {Math.round(confidence * 100)}% CONF · {activeMode}
                  </div>
                </div>

                <div className="h-10 w-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />

                {/* Gesture tiles */}
                <div className="flex gap-2 flex-shrink-0 flex-wrap" style={{ maxWidth: 420 }}>
                  {GESTURE_DEFS.map(g => {
                    const isOn = currentGesture === g.id ||
                      (g.id === 'Palm_Swipe' && currentGesture === 'Open_Palm');
                    const hp = holdProgress[g.id] ?? 0;
                    const Icon = g.icon;
                    return (
                      <motion.div key={g.id}
                        className="relative flex flex-col items-center gap-1"
                        animate={isOn && !g.holdMs ? { y: [0, -2, 0] } : { y: 0 }}
                        transition={isOn && !g.holdMs ? { duration: 0.65, repeat: Infinity } : {}}>
                        <div className="relative w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{
                            background: isOn ? `${g.color}22` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isOn ? g.color + '62' : 'rgba(255,255,255,0.07)'}`,
                            boxShadow: isOn ? `0 0 18px ${g.glow}, inset 0 0 8px ${g.color}10` : 'none',
                            transition: 'all 0.22s ease',
                          }}>
                          <Icon size={15} style={{ color: isOn ? g.color : '#2d3748', transition: 'color 0.2s' }} />
                          {/* Hold ring */}
                          {g.holdMs !== null && hp > 0 && <HoldRing progress={hp} color={g.color} />}
                          {/* Fired flash */}
                          {justFired === g.id && (
                            <motion.div className="absolute inset-0 rounded-xl"
                              style={{ background: g.color }}
                              initial={{ opacity: 0.45 }} animate={{ opacity: 0 }}
                              transition={{ duration: 0.38 }} />
                          )}
                        </div>
                        <span style={{
                          fontFamily: 'monospace', fontSize: 7,
                          color: isOn ? g.color : '#2d3748',
                          letterSpacing: '0.13em', textTransform: 'uppercase',
                          transition: 'color 0.2s',
                        }}>
                          {g.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="h-10 w-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />

                {/* Mini camera viewport */}
                <div className="relative flex-shrink-0 rounded-xl overflow-hidden"
                  style={{ width: 116, height: 66, background: '#000', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <video ref={videoRef} autoPlay playsInline muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.32, filter: 'grayscale(100%) contrast(1.2)', transform: 'scaleX(-1)' }} />
                  {/* Sweep line */}
                  <motion.div className="absolute left-0 right-0 h-px pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent, ${activeColor}65, transparent)` }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }} />
                  {/* HUD corner brackets */}
                  {([
                    { top: 4, left: 4, bt: 1, bl: 1, br: 0, bb: 0 },
                    { top: 4, right: 4, bt: 1, bl: 0, br: 1, bb: 0 },
                    { bottom: 4, left: 4, bt: 0, bl: 1, br: 0, bb: 1 },
                    { bottom: 4, right: 4, bt: 0, bl: 0, br: 1, bb: 1 },
                  ] as any[]).map((c, i) => (
                    <div key={i} className="absolute w-3 h-3 pointer-events-none"
                      style={{
                        top: c.top, right: c.right, bottom: c.bottom, left: c.left,
                        borderTopWidth: c.bt, borderLeftWidth: c.bl,
                        borderRightWidth: c.br, borderBottomWidth: c.bb,
                        borderColor: activeColor, borderStyle: 'solid', opacity: 0.65,
                      }} />
                  ))}
                  <Trail points={trail} color={activeColor} />
                  <AnimatePresence>
                    {handPosition && (
                      <motion.div className="absolute z-10 pointer-events-none"
                        style={{ left: `${handPosition.x * 100}%`, top: `${handPosition.y * 100}%`, transform: 'translate(-50%,-50%)' }}
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 28 }}>
                        <div style={{
                          width: 9, height: 9, borderRadius: '50%',
                          background: activeColor, boxShadow: `0 0 10px ${activeColor}`,
                        }} />
                        <motion.div className="absolute"
                          style={{ inset: -5, borderRadius: '50%', border: `1px solid ${activeColor}`, opacity: 0.5 }}
                          animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Utility buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <motion.button onClick={() => setShowGuide(s => !s)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: showGuide ? 'rgba(129,140,248,0.18)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${showGuide ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}>
                    <BookOpen size={12} style={{ color: showGuide ? '#818cf8' : '#374151' }} />
                  </motion.button>
                  <motion.button onClick={onToggle}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}>
                    <X size={11} style={{ color: '#374151' }} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mobile toggle pill */}
        <motion.button onClick={onToggle}
          className="md:hidden absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: isActive ? activeColor : 'rgba(15,23,42,0.9)',
            border: `1px solid ${isActive ? activeColor : 'rgba(255,255,255,0.09)'}`,
            boxShadow: isActive ? `0 0 18px ${activeGlow}` : 'none',
          }}
          whileTap={{ scale: 0.88 }}>
          {isActive
            ? <Hand size={17} color="#fff" />
            : <Camera size={17} style={{ color: '#64748b' }} />}
        </motion.button>
      </div>
    </>
  );
};

export default GestureController;
