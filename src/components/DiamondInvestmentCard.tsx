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
        // Layered diamond/platinum finish — clear, icy, prismatic.
        backgroundImage: [
          // Top gloss
          "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 45%)",
          // Prismatic hint (very subtle rainbow refraction)
          "linear-gradient(115deg, rgba(255,210,230,0.18) 0%, rgba(210,230,255,0.18) 35%, rgba(220,255,235,0.18) 65%, rgba(255,240,210,0.18) 100%)",
          // Platinum body
          "linear-gradient(160deg, #e9eef5 0%, #f6f8fb 25%, #c8d1dc 55%, #eef2f7 100%)",
          // Icy sheen
          "radial-gradient(120% 80% at 20% 10%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 55%)",
          "radial-gradient(80% 60% at 90% 90%, rgba(180,200,220,0.55) 0%, rgba(180,200,220,0) 60%)",
        ].join(","),
        boxShadow: [
          "inset 0 0 0 1px rgba(255,255,255,0.6)",
          "inset 0 1px 0 rgba(255,255,255,0.8)",
          "inset 0 -1px 0 rgba(120,140,170,0.35)",
        ].join(","),
      }}

    >
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
              "radial-gradient(60% 55% at 50% 55%, rgba(200,215,235,0.75) 0%, rgba(200,215,235,0) 70%)",
            filter: "blur(24px)",
          }}
          animate={{ opacity: [0.45, 0.75, 0.45] }}
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
                <StatusPill label={DUMMY.front.status} />
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
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-800">
                  Certificate
                </span>
                <StatusPill label={DUMMY.back.status} />
              </div>

              <div className="space-y-2">
                <Row label="Investor" value={DUMMY.back.investorName} />
                <Row label="ID" value={DUMMY.back.investmentId} />
                <Row label="Start" value={DUMMY.back.startDate} />
                <Row label="Maturity" value={DUMMY.back.maturityDate} />
                <Row label="Expected Return" value={DUMMY.back.expectedReturn} />
              </div>

              <div className="flex items-center justify-between border-t border-slate-900/10 pt-3">
                <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  Diamond Reserve
                </span>
                <span className="text-[10px] tracking-[0.2em] text-slate-600">
                  ◆ ◆ ◆
                </span>
              </div>
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
