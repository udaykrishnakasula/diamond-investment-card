import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

// -----------------------------------------------------------------------------
// DiamondInvestmentCard
// A single reusable, self-contained 3D luxury investment card.
// UI-only — all data below is dummy data.
// -----------------------------------------------------------------------------

const DUMMY = {
  front: {
    plan: "Diamond",
    investment: "$5,000",
    lockPeriod: "60 Days",
    returnPct: "160%",
    status: "Active",
    progress: 45,
  },
  back: {
    investorName: "John Carter",
    investmentId: "INV-2026-0001",
    startDate: "20 Jul 2026",
    maturityDate: "18 Sep 2026",
    expectedReturn: "$8,000",
    status: "Active",
  },
} as const;

// Resting tilt — a premium, off-axis viewing angle.
const REST_X = -8;
const REST_Y = -14;

// Tiny inline noise texture for a subtle grain overlay.
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
        <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/>
    </svg>`,
  );

type FaceProps = { children: React.ReactNode; back?: boolean };

function CardFace({ children, back = false }: FaceProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[24px]"
      style={{
        transform: back ? "rotateY(180deg)" : undefined,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        // Faceted diamond finish: conic facets + prismatic tints + icy base.
        backgroundImage: [
          "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%)",
          "linear-gradient(30deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 12%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.14) 55%, rgba(255,255,255,0) 88%)",
          "linear-gradient(150deg, rgba(180,210,240,0.22) 0%, rgba(180,210,240,0) 20%, rgba(255,255,255,0) 55%, rgba(200,220,255,0.18) 80%)",
          "conic-gradient(from 200deg at 65% 40%, rgba(255,255,255,0.18), rgba(200,230,255,0) 25%, rgba(230,210,255,0.14) 50%, rgba(255,255,255,0) 75%, rgba(255,255,255,0.16) 100%)",
          "conic-gradient(from 20deg at 50% 50%, #ffffff 0deg, #dfeaf7 30deg, #e6dff7 60deg, #f7dfe9 95deg, #fef2dc 130deg, #e6f7ef 165deg, #dff0fa 200deg, #e9e0f7 235deg, #ffffff 270deg, #d8e6f4 305deg, #ffffff 360deg)",
          "linear-gradient(160deg, #eef4fb 0%, #ffffff 40%, #dbe6f3 100%)",
        ].join(","),
        boxShadow: [
          "inset 0 0 0 1px rgba(255,255,255,0.75)",
          "inset 0 1px 0 rgba(255,255,255,0.95)",
          "inset 0 -1px 0 rgba(90,120,160,0.4)",
          "inset 8px 8px 24px rgba(255,255,255,0.35)",
          "inset -10px -14px 30px rgba(80,110,150,0.25)",
        ].join(","),
      }}
    >
      {/* Prismatic fire — slow drifting rainbow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(115deg, rgba(255,90,120,0.18) 0%, rgba(255,180,90,0.16) 15%, rgba(255,240,120,0.16) 30%, rgba(120,230,160,0.16) 45%, rgba(120,200,255,0.18) 60%, rgba(150,140,255,0.18) 78%, rgba(230,130,230,0.16) 100%)",
          backgroundSize: "220% 100%",
          mixBlendMode: "screen",
          filter: "blur(4px)",
        }}
        animate={{ backgroundPositionX: ["0%", "100%", "0%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sparkle points */}
      {[
        { top: "14%", left: "22%", d: 0 },
        { top: "32%", left: "78%", d: 1.1 },
        { top: "58%", left: "18%", d: 2.2 },
        { top: "72%", left: "62%", d: 0.6 },
        { top: "22%", left: "54%", d: 1.7 },
        { top: "82%", left: "88%", d: 2.8 },
      ].map((s, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: 3,
            height: 3,
            background: "white",
            boxShadow:
              "0 0 6px 1px rgba(255,255,255,0.9), 0 0 12px 2px rgba(200,230,255,0.6)",
            mixBlendMode: "screen",
          }}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.3, 0.7] }}
          transition={{
            duration: 2.6 + (i % 3) * 0.6,
            repeat: Infinity,
            delay: s.d,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Noise grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />
      {children}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const size = 56;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);
  useEffect(() => {
    const t = requestAnimationFrame(() => setOffset(c - (value / 100) * c));
    return () => cancelAnimationFrame(t);
  }, [c, value]);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#diamondRing)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,.61,.36,1)" }}
        />
        <defs>
          <linearGradient id="diamondRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8fa3bd" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-semibold tracking-wide text-slate-900">
        {value}%
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="uppercase tracking-[0.14em] text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/20 bg-white/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-900 backdrop-blur-md">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      {label}
    </span>
  );
}

// Highlight layer that tracks rotation for realistic lighting shift.
function DynamicHighlight({
  rx,
  ry,
}: {
  rx: MotionValue<number>;
  ry: MotionValue<number>;
}) {
  const bgX = useTransform(ry, [-180, 180], ["100%", "0%"]);
  const bgY = useTransform(rx, [-180, 180], ["0%", "100%"]);
  const background = useTransform(
    [bgX, bgY] as unknown as MotionValue<string>[],
    (latest) => {
      const [x, y] = latest as unknown as [string, string];
      return `radial-gradient(60% 45% at ${x} ${y}, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0) 70%)`;
    },
  );
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-[24px] mix-blend-screen"
      style={{ background }}
    />
  );
}

export interface DiamondInvestmentCardProps {
  className?: string;
}

export function DiamondInvestmentCard({ className }: DiamondInvestmentCardProps) {
  const rotX = useMotionValue(REST_X);
  const rotY = useMotionValue(REST_Y);
  const springX = useSpring(rotX, { stiffness: 120, damping: 18, mass: 0.6 });
  const springY = useSpring(rotY, { stiffness: 120, damping: 18, mass: 0.6 });

  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      setDragging(true);
      lastRef.current = { x: e.clientX, y: e.clientY };
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastRef.current.x;
      const dy = e.clientY - lastRef.current.y;
      lastRef.current = { x: e.clientX, y: e.clientY };
      // Full 360° freedom on both axes.
      rotY.set(rotY.get() + dx * 0.6);
      rotX.set(rotX.get() - dy * 0.6);
    },
    [rotX, rotY],
  );


  const endDrag = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      // Hold position — do NOT snap back. Card stays wherever the user left it.
    },
    [],
  );

  const onPointerLeave = useCallback(
    (_e: PointerEvent<HTMLDivElement>) => {
      // Do not reset when the pointer leaves — keep current rotation.
    },
    [],
  );


  return (
    <div
      className={
        "relative select-none " +
        "w-full max-w-[420px] " +
        (className ?? "")
      }
      style={{ perspective: 1200 }}
    >
      {/* Floating wrapper: idle float + hover lift. */}
      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={dragging ? { y: 0 } : { y: [0, -6, 0] }}
        transition={
          dragging
            ? { duration: 0.4 }
            : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={{ scale: 1.02 }}
      >
        {/* Soft breathing outer glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-[36px]"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 55%, rgba(170,220,255,0.75) 0%, rgba(210,180,255,0.35) 45%, rgba(200,215,235,0) 75%)",
            filter: "blur(28px)",
          }}
          animate={{ opacity: [0.45, 0.85, 0.45] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Interactive 3D card body */}
        <motion.div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={onPointerLeave}
          className="relative aspect-[42/26] w-full cursor-grab touch-none rounded-[24px] active:cursor-grabbing"
          style={{
            transformStyle: "preserve-3d",
            rotateX: springX,
            rotateY: springY,
            willChange: "transform",
            boxShadow:
              "0 30px 60px -20px rgba(6,20,40,0.7), 0 10px 25px -10px rgba(6,20,40,0.5)",
          }}
        >
          {/* FRONT */}
          <CardFace>
            <div className="relative flex h-full w-full flex-col justify-between p-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[15px] leading-none"
                    style={{
                      background:
                        "linear-gradient(180deg,#64748b 0%,#0f172a 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    ◆
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-800">
                    Diamond
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Chip glyph */}
                  <div
                    aria-hidden
                    className="h-[18px] w-[24px] rounded-[4px]"
                    style={{
                      backgroundImage:
                        "conic-gradient(from 20deg at 50% 50%, #ffffff 0deg, #dfeaf7 60deg, #e6dff7 120deg, #fef2dc 180deg, #dff0fa 240deg, #e9e0f7 300deg, #ffffff 360deg), linear-gradient(160deg,#eef4fb,#dbe6f3)",
                      boxShadow:
                        "inset 0 0 0 1px rgba(255,255,255,0.7), inset 0 0 0 2px rgba(90,120,160,0.25)",
                    }}
                  />
                  <StatusPill label={DUMMY.front.status} />
                </div>
              </div>

              {/* Middle */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Investment
                  </div>
                  <div
                    className="mt-1 text-[34px] font-semibold leading-none tracking-tight"
                    style={{
                      background:
                        "linear-gradient(180deg,#1e293b 0%,#64748b 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {DUMMY.front.investment}
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                    Plan · {DUMMY.front.plan}
                  </div>
                </div>
                <ProgressRing value={DUMMY.front.progress} />
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between border-t border-slate-900/10 pt-3">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Lock Period
                  </div>
                  <div className="text-[13px] font-medium text-slate-900">
                    {DUMMY.front.lockPeriod}
                  </div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.2em] text-slate-500">
                    ··· 0001
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Return
                  </div>
                  <div
                    className="text-[15px] font-semibold"
                    style={{
                      background:
                        "linear-gradient(180deg,#334155 0%,#0f172a 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {DUMMY.front.returnPct}
                  </div>
                </div>
              </div>

              {/* Shine sweep (front) */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 100%)",
                  filter: "blur(2px)",
                  mixBlendMode: "screen",
                }}
                animate={{ x: ["-40%", "260%"] }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  repeatDelay: 2.6,
                  ease: "easeInOut",
                }}
              />
            </div>
          </CardFace>

          {/* BACK */}
          <CardFace back>
            <div className="relative flex h-full w-full flex-col justify-between p-5">
              {/* Header band */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[13px] leading-none"
                      style={{
                        background:
                          "linear-gradient(180deg,#64748b 0%,#0f172a 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      ◆
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.32em]"
                      style={{
                        background:
                          "linear-gradient(180deg,#1e293b 0%,#64748b 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      Diamond Reserve
                    </span>
                  </div>
                  <StatusPill label={DUMMY.back.status} />
                </div>
                {/* Notched hairline divider */}
                <div className="relative mt-2 flex items-center">
                  <span className="h-px flex-1 bg-slate-900/15" />
                  <span className="mx-1.5 text-[8px] text-slate-500">◆</span>
                  <span className="h-px flex-1 bg-slate-900/15" />
                </div>
              </div>

              {/* Investor hero */}
              <div>
                <div className="text-[9px] uppercase tracking-[0.24em] text-slate-500">
                  Certificate Holder
                </div>
                <div
                  className="mt-0.5 text-[22px] font-semibold leading-none tracking-tight"
                  style={{
                    background:
                      "linear-gradient(180deg,#1e293b 0%,#64748b 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {DUMMY.back.investorName}
                </div>
                <div className="mt-2 inline-flex rounded-md border border-slate-900/15 bg-white/30 px-2 py-0.5 backdrop-blur-[2px]">
                  <span className="font-mono text-[10px] tracking-[0.24em] text-slate-800">
                    {DUMMY.back.investmentId}
                  </span>
                </div>
              </div>

              {/* Timeline strip */}
              <div className="relative">
                <div className="mb-1 flex items-center justify-between text-[8px] uppercase tracking-[0.24em] text-slate-500">
                  <span>Start</span>
                  <span>Maturity</span>
                </div>
                <div className="relative h-[10px]">
                  <span
                    className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg,#334155 0%,#7dd3fc 50%,#334155 100%)",
                      opacity: 0.55,
                    }}
                  />
                  <span className="absolute left-0 top-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800 ring-2 ring-white/70" />
                  <span className="absolute right-0 top-1/2 h-[8px] w-[8px] translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800 ring-2 ring-white/70" />
                  <motion.span
                    className="absolute top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full"
                    style={{
                      left: "45%",
                      background: "#0ea5e9",
                      boxShadow:
                        "0 0 0 3px rgba(14,165,233,0.25), 0 0 8px rgba(14,165,233,0.6)",
                    }}
                    animate={{ opacity: [0.7, 1, 0.7], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-slate-900">
                  <span>{DUMMY.back.startDate}</span>
                  <span>{DUMMY.back.maturityDate}</span>
                </div>
              </div>

              {/* Expected return highlight */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.24em] text-slate-500">
                    Issued
                  </div>
                  <div className="text-[10px] text-slate-700">
                    {DUMMY.back.startDate} · Non-transferable
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Expected Return
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[11px] text-emerald-600">▲</span>
                    <span
                      className="text-[18px] font-semibold leading-none"
                      style={{
                        background:
                          "linear-gradient(180deg,#334155 0%,#0f172a 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {DUMMY.back.expectedReturn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: signature + seal */}
              <div className="flex items-end justify-between border-t border-slate-900/10 pt-2">
                <div>
                  <div
                    className="border-b border-slate-900/25 pb-0.5 font-serif text-[17px] italic leading-none text-slate-800/85"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    John Carter
                  </div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.24em] text-slate-500">
                    Authorized Signature
                  </div>
                </div>
                <div className="relative h-[36px] w-[36px]">
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundImage:
                        "conic-gradient(from 0deg,#ffffff,#dfeaf7,#e6dff7,#f7dfe9,#fef2dc,#e6f7ef,#dff0fa,#ffffff)",
                      padding: 1,
                      WebkitMask:
                        "radial-gradient(circle, transparent 55%, black 56%)",
                      mask: "radial-gradient(circle, transparent 55%, black 56%)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <div
                    className="absolute inset-[3px] grid place-items-center rounded-full text-[12px] text-slate-800"
                    style={{
                      background:
                        "radial-gradient(circle at 35% 30%, #ffffff 0%, #dbe6f3 70%, #b8c7dc 100%)",
                      boxShadow:
                        "inset 0 0 0 1px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(90,120,160,0.35)",
                    }}
                  >
                    ◆
                  </div>
                </div>
              </div>

              {/* Shine sweep (back — slower) */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.22) 55%, rgba(255,255,255,0) 100%)",
                  filter: "blur(2px)",
                  mixBlendMode: "screen",
                }}
                animate={{ x: ["-40%", "260%"] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut",
                }}
              />
            </div>
          </CardFace>


          {/* Dynamic lighting overlay (front-facing highlight) */}
          <DynamicHighlight rx={springX} ry={springY} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default DiamondInvestmentCard;
