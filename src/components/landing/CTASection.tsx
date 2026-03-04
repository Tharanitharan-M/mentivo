"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

/* ─── Bento card data ───────────────────────────────────── */
type CardType =
  | { kind: "quote"; quote: string; name: string; role: string; avatar: string; initial: string }
  | { kind: "stat"; value: string; label: string; sub: string; accent: string }
  | { kind: "before-after"; before: string; after: string; name: string }
  | { kind: "project"; name: string; project: string; stack: string; color: string; initial: string };

const COL_1: CardType[] = [
  {
    kind: "quote",
    quote: "I tried 4 courses before Mentivo. First time I finished something and actually knew why it worked.",
    name: "Arjun M.",
    role: "Built: Personal Portfolio",
    avatar: "#3b82f6",
    initial: "A",
  },
  {
    kind: "stat",
    value: "94%",
    label: "Completion rate",
    sub: "vs. 13% for typical online courses",
    accent: "#22c55e",
  },
  {
    kind: "before-after",
    before: "6 months of YouTube tutorials, still couldn't build anything.",
    after: "Shipped my first real app in 3 weeks.",
    name: "Sofia R.",
  },
  {
    kind: "quote",
    quote: "The AI never just gives you the answer. It's frustrating in the best way, but that's exactly why it sticks.",
    name: "Marcus L.",
    role: "Built: Budget Tracker",
    avatar: "#a855f7",
    initial: "M",
  },
  {
    kind: "project",
    name: "Priya K.",
    project: "Habit Tracker",
    stack: "React + SQLite",
    color: "#f97316",
    initial: "P",
  },
  {
    kind: "stat",
    value: "2,400+",
    label: "Active learners",
    sub: "building real projects right now",
    accent: "#3b82f6",
  },
];

const COL_2: CardType[] = [
  {
    kind: "project",
    name: "Kyle T.",
    project: "Task Manager",
    stack: "HTML + CSS + JS",
    color: "#22c55e",
    initial: "K",
  },
  {
    kind: "quote",
    quote: "3 weeks in, I shipped a CRUD app. It's basic, but I wrote every line and I can explain all of it.",
    name: "Kyle T.",
    role: "Built: Task Manager",
    avatar: "#22c55e",
    initial: "K",
  },
  {
    kind: "stat",
    value: "850+",
    label: "Projects shipped",
    sub: "real apps deployed by learners",
    accent: "#f97316",
  },
  {
    kind: "before-after",
    before: "Copied AI code I didn't understand for months.",
    after: "Now I debug my own code without asking anyone.",
    name: "Emma J.",
  },
  {
    kind: "quote",
    quote: "I was completely non-technical. Mentivo started by explaining what a browser even does. Now I have a live app.",
    name: "Priya K.",
    role: "Built: Habit Tracker",
    avatar: "#f97316",
    initial: "P",
  },
  {
    kind: "project",
    name: "David W.",
    project: "Recipe App",
    stack: "React + Node.js",
    color: "#a855f7",
    initial: "D",
  },
];

/* ─── Individual card renderers ─────────────────────────── */
function QuoteCard({ card }: { card: Extract<CardType, { kind: "quote" }> }) {
  return (
    <div className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.07]">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-slate-300 text-sm leading-[1.65] mb-4">&ldquo;{card.quote}&rdquo;</p>
      <div className="flex items-center gap-2.5 pt-3 border-t border-white/[0.05]">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
          style={{ background: card.avatar }}
        >
          {card.initial}
        </div>
        <div>
          <p className="text-white text-[13px] font-semibold leading-none mb-0.5">{card.name}</p>
          <p className="text-slate-500 text-[11px]">{card.role}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ card }: { card: Extract<CardType, { kind: "stat" }> }) {
  return (
    <div
      className="rounded-2xl px-6 py-5 text-center"
      style={{
        background: `${card.accent}10`,
        border: `1px solid ${card.accent}28`,
      }}
    >
      <p className="text-4xl font-black mb-1 leading-none" style={{ color: card.accent }}>
        {card.value}
      </p>
      <p className="text-white text-sm font-semibold mb-0.5">{card.label}</p>
      <p className="text-slate-500 text-xs">{card.sub}</p>
    </div>
  );
}

function BeforeAfterCard({ card }: { card: Extract<CardType, { kind: "before-after" }> }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.07]">
      <div className="px-4 py-3.5 bg-red-500/8 border-b border-white/[0.05]">
        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5">Before</p>
        <p className="text-slate-400 text-xs leading-relaxed">{card.before}</p>
      </div>
      <div className="px-4 py-3.5 bg-green-500/8">
        <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1.5">After Mentivo</p>
        <p className="text-slate-300 text-xs leading-relaxed font-medium">{card.after}</p>
      </div>
      <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.04]">
        <p className="text-slate-600 text-[11px]">{card.name}</p>
      </div>
    </div>
  );
}

function ProjectCard({ card }: { card: Extract<CardType, { kind: "project" }> }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ background: `${card.color}08`, border: `1px solid ${card.color}22` }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg"
        style={{ background: card.color }}
      >
        {card.initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-[13px] font-bold leading-none mb-1">{card.name}</p>
        <p className="text-slate-400 text-xs mb-1.5">Shipped: <span className="text-white font-medium">{card.project}</span></p>
        <div
          className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ color: card.color, background: `${card.color}15`, border: `1px solid ${card.color}30` }}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {card.stack}
        </div>
      </div>
      <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

function BentoCard({ card }: { card: CardType }) {
  if (card.kind === "quote") return <QuoteCard card={card} />;
  if (card.kind === "stat") return <StatCard card={card} />;
  if (card.kind === "before-after") return <BeforeAfterCard card={card} />;
  if (card.kind === "project") return <ProjectCard card={card} />;
  return null;
}

/* ─── Scrolling column ──────────────────────────────────── */
function ScrollColumn({
  cards,
  duration,
  colRef,
}: {
  cards: CardType[];
  duration: number;
  colRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Render cards twice for seamless loop
  const doubled = [...cards, ...cards];
  return (
    <div className="flex flex-col gap-3 will-change-transform" ref={colRef}>
      {doubled.map((card, i) => (
        <BentoCard key={i} card={card} />
      ))}
    </div>
  );
}

/* ─── Main Section ──────────────────────────────────────── */
export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const col1Ref    = useRef<HTMLDivElement>(null);
  const col2Ref    = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const tween1Ref  = useRef<gsap.core.Tween | null>(null);
  const tween2Ref  = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const col1    = col1Ref.current;
    const col2    = col2Ref.current;
    const wrapper = wrapperRef.current;
    const cta     = ctaRef.current;
    if (!col1 || !col2) return;

    /* ── Infinite scroll columns ── */
    tween1Ref.current = gsap.to(col1, {
      y: () => -(col1.offsetHeight / 2),
      ease: "linear", duration: 28, repeat: -1,
    });
    tween2Ref.current = gsap.to(col2, {
      y: () => -(col2.offsetHeight / 2),
      ease: "linear", duration: 36, repeat: -1,
    });

    /* Pause on hover */
    const pause = () => { tween1Ref.current?.pause(); tween2Ref.current?.pause(); };
    const play  = () => { tween1Ref.current?.play();  tween2Ref.current?.play();  };
    wrapper?.addEventListener("mouseenter", pause);
    wrapper?.addEventListener("mouseleave", play);

    /* ── CTA block — set hidden via GSAP (not JSX), trigger on entry ── */
    if (cta) {
      gsap.set(cta, { opacity: 0, y: 50 });
      gsap.to(cta, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: cta, start: "top bottom", once: true },
      });
    }

    return () => {
      tween1Ref.current?.kill();
      tween2Ref.current?.kill();
      wrapper?.removeEventListener("mouseenter", pause);
      wrapper?.removeEventListener("mouseleave", play);
    };
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="relative overflow-hidden pb-28">
      {/* ── Testimonials bento scroll ── */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <div className="section-label mx-auto w-fit mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            What learners say
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            People who built something real
          </h2>
          <p className="text-slate-500 text-sm mt-2">Hover to pause the scroll</p>
        </div>

        {/* Scrolling columns container */}
        <div
          ref={wrapperRef}
          className="relative h-[560px] overflow-hidden cursor-default"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          <div className="grid grid-cols-2 gap-3 h-full">
            <ScrollColumn cards={COL_1} duration={28} colRef={col1Ref} />
            <ScrollColumn cards={COL_2} duration={36} colRef={col2Ref} />
          </div>
        </div>
      </div>

      {/* ── CTA block ── */}
      <div ref={ctaRef} className="max-w-4xl mx-auto px-6">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f1e3d 0%, #0a1628 45%, #111827 100%)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          {/* Top shimmer line */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px"
            style={{
              background: "linear-gradient(to right, transparent, rgba(96,165,250,0.55), transparent)",
            }}
          />
          {/* Glow blob */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-52 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(59,130,246,0.13) 0%, transparent 70%)",
            }}
          />

          <div className="relative px-8 py-16 sm:px-16 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 text-[13px] font-medium">
                Free to start. No credit card needed.
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
              Stop watching.
              <br />
              <span className="gradient-text-blue">Start building.</span>
            </h2>

            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed mb-10">
              Describe your first project idea and start building it for real
              with a mentor that makes sure you understand every line.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Link
                href="#"
                className="btn-shimmer flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-500 text-white font-bold text-base hover:bg-blue-400 transition-all shadow-2xl shadow-blue-500/25 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
              >
                Start building free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/12 text-slate-300 font-semibold text-base hover:bg-white/5 hover:text-white transition-all w-full sm:w-auto justify-center"
              >
                See how it works
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-slate-500 text-sm">
              {[
                "No local setup needed",
                "Write code in your browser",
                "Your real project, not a template",
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
