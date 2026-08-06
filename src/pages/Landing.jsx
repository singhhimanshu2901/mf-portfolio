import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ======================================
// Landing / Intro Page
// ======================================
// Design language: "ledger meets moonlight" — ink navy + brass gold,
// grounded in the world of Indian mutual fund investing (folios, NAV,
// SIPs, compounding) rather than a generic dark-dashboard template.
// Signature element: a hand-inked rising NAV line that draws itself in
// on load, annotated with real dated milestones from an investing
// journey (not a generic 01/02/03 stepper).

const HERO_PATH =
  "M0,235 C40,225 60,200 90,205 C120,210 140,225 160,215 " +
  "C190,200 210,165 240,170 C265,175 275,205 290,200 " +
  "C320,190 340,155 370,150 C410,145 430,120 460,115 " +
  "C495,110 510,95 540,100 C565,105 575,120 590,110 " +
  "C620,95 640,65 670,55 C700,45 720,35 750,25 C770,20 785,15 800,10";

function HeroChart() {
  const pathRef = useRef(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDrawn(true);
      return;
    }

    const timer = setTimeout(() => setDrawn(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 800 300"
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Ledger ruling — faint horizontal lines, ties to passbook motif */}
        {[40, 90, 140, 190, 240].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="800"
            y2={y}
            stroke="#2A3559"
            strokeWidth="1"
            opacity="0.35"
          />
        ))}

        {/* Soft brass glow under the line */}
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C9A24B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#E8CE8B" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <path
          ref={pathRef}
          d={HERO_PATH}
          fill="none"
          stroke="url(#lineGlow)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="1"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: drawn ? 0 : 1,
            transition: "stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)"
          }}
        />

        {/* Milestone stamps — a real chronology, not decoration */}
        <g
          style={{
            opacity: drawn ? 1 : 0,
            transition: "opacity 0.6s ease 1.6s"
          }}
        >
          <circle cx="160" cy="215" r="3.5" fill="#9AA3C0" />
          <circle cx="290" cy="200" r="3.5" fill="#9AA3C0" />
          <circle cx="800" cy="10" r="6" fill="#E8CE8B">
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>

      {/* Milestone labels, positioned to roughly track the SVG points */}
      <div
        className="pointer-events-none absolute inset-0 font-mono text-[11px] sm:text-xs"
        style={{
          opacity: drawn ? 1 : 0,
          transition: "opacity 0.6s ease 1.6s"
        }}
      >
        <span
          className="absolute text-[#9AA3C0]"
          style={{ left: "16%", top: "76%" }}
        >
          First SIP
        </span>
        <span
          className="absolute text-[#9AA3C0]"
          style={{ left: "34%", top: "70%" }}
        >
          Held through the dip
        </span>
        <div
          className="absolute flex flex-col items-end"
          style={{ right: "0%", top: "-2%" }}
        >
          <div className="rounded-full border border-[#E8CE8B]/50 bg-[#121A30] px-3 py-1 text-[#E8CE8B]">
            +18.4% XIRR
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: "#0A0F1E",
        color: "#F3EFE4",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <style>{`
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {/* ============================== */}
      {/* Nav */}
      {/* ============================== */}

      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 sm:px-10 py-7">
        <div className="font-display text-xl tracking-tight">
          MF Portfolio
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-sm">
          <Link
            to="/login"
            className="text-[#9AA3C0] hover:text-[#F3EFE4] transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full border border-[#C9A24B]/60 px-4 py-2 text-[#E8CE8B] hover:bg-[#C9A24B]/10 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ============================== */}
      {/* Hero */}
      {/* ============================== */}

      <header className="max-w-6xl mx-auto px-6 sm:px-10 pt-10 sm:pt-16 pb-8">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#9AA3C0] mb-6">
          Built for Indian mutual fund investors
        </p>

        <h1 className="font-display text-4xl sm:text-6xl leading-[1.08] max-w-3xl">
          Every folio, every rupee,
          <br />
          <span className="italic text-[#E8CE8B]">one clear picture.</span>
        </h1>

        <p className="mt-6 max-w-xl text-[#9AA3C0] text-base sm:text-lg leading-relaxed">
          Track SIPs and lumpsum investments across every fund house, compare
          against FDs and the Nifty, and see exactly how your money is
          growing — free, and without spreadsheets.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            to="/register"
            className="rounded-full bg-[#C9A24B] text-[#0A0F1E] font-semibold px-7 py-3.5 hover:bg-[#E8CE8B] transition-colors"
          >
            Get Started — it's free
          </Link>
          <Link
            to="/login"
            className="text-[#F3EFE4]/80 hover:text-[#F3EFE4] underline underline-offset-4 decoration-[#2A3559] px-2 py-3.5 transition-colors"
          >
            I already have an account
          </Link>
        </div>

        <div className="mt-16 sm:mt-20">
          <HeroChart />
        </div>
      </header>

      {/* ============================== */}
      {/* Ledger strip — three features, styled as passbook rows */}
      {/* ============================== */}

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24 border-t border-[#1C2440]">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#9AA3C0] mb-10">
          What you get
        </p>

        <div className="divide-y divide-[#1C2440]">
          <LedgerRow
            title="Live Holdings"
            description="See current value, units and NAV for every fund, updated with the latest published NAV."
          />
          <LedgerRow
            title="FD & Nifty Comparison"
            description="Know whether your mutual funds are actually beating a fixed deposit or the index — not just assuming."
          />
          <LedgerRow
            title="One-tap Reports"
            description="Download a clean PDF summary of your whole portfolio, or a deep-dive on any single fund."
          />
        </div>
      </section>

      {/* ============================== */}
      {/* Closing CTA */}
      {/* ============================== */}

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-24 border-t border-[#1C2440]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <h2 className="font-display text-3xl sm:text-4xl max-w-md leading-tight">
            Your portfolio, finally in focus.
          </h2>

          <Link
            to="/register"
            className="shrink-0 rounded-full bg-[#C9A24B] text-[#0A0F1E] font-semibold px-7 py-3.5 hover:bg-[#E8CE8B] transition-colors w-fit"
          >
            Get Started — it's free
          </Link>
        </div>
      </section>

      {/* ============================== */}
      {/* Footer */}
      {/* ============================== */}

      <footer className="max-w-6xl mx-auto px-6 sm:px-10 py-8 border-t border-[#1C2440] flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-[#6B7398]">
        <span>MF Portfolio · Built for retail investors</span>
        <span>NAV data via AMFI. Not investment advice.</span>
      </footer>
    </div>
  );
}

function LedgerRow({ title, description }) {
  return (
    <div className="py-7 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-10 group">
      <h3 className="font-display text-xl sm:text-2xl sm:w-64 shrink-0 group-hover:text-[#E8CE8B] transition-colors">
        {title}
      </h3>
      <p className="text-[#9AA3C0] leading-relaxed max-w-xl">{description}</p>
    </div>
  );
}
