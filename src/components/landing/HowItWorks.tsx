"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

/* ─── Shared screenshot frame ───────────────────────────── */
function ScreenFrame({
  src,
  alt,
  label,
  width,
  height,
  maxH = 260,
}: {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  maxH?: number;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden w-full"
      style={{
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      }}
    >
      {/* Mini chrome */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07]"
        style={{ background: "rgba(8,10,20,0.98)" }}
      >
        <div className="flex gap-1 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[10px] text-slate-500 truncate ml-1">{label}</span>
      </div>
      {/* Screenshot */}
      <div className="relative overflow-hidden" style={{ maxHeight: maxH }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full"
          style={{ objectFit: "cover", objectPosition: "top" }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-12 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(8,10,20,0.9), transparent)",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Step data ─────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    accent: "#3b82f6",
    accentMuted: "rgba(59,130,246,0.12)",
    accentBorder: "rgba(59,130,246,0.25)",
    tag: "Step 1",
    title: "Describe what you want to build",
    body: "Open Mentivo and describe your idea in plain English. It asks a few focused questions to understand exactly what you want, then tailors everything around your specific project — not a generic template.",
    callout: "Your idea, not a pre-made template.",
    preview: (
      <ScreenFrame
        src="/screenshots/dashboard.png"
        alt="Mentivo dashboard – describe your idea"
        label="mentivo.app/dashboard"
        width={1024}
        height={845}
        maxH={280}
      />
    ),
  },
  {
    num: "02",
    accent: "#f97316",
    accentMuted: "rgba(249,115,22,0.1)",
    accentBorder: "rgba(249,115,22,0.25)",
    tag: "Step 2",
    title: "Get a personalized learning roadmap",
    body: "After a quick 6-question skill check, Mentivo generates a roadmap of 5–8 milestones perfectly matched to your current level. Complete beginner? It starts with what HTML even is. Already know the basics? It skips ahead.",
    callout: "7 milestones. 17–24 hours. Tailored to you.",
    preview: (
      <ScreenFrame
        src="/screenshots/roadmap.png"
        alt="Mentivo personalized learning roadmap"
        label="mentivo.app/dashboard/project/roadmap"
        width={600}
        height={1800}
        maxH={300}
      />
    ),
  },
  {
    num: "03",
    accent: "#22c55e",
    accentMuted: "rgba(34,197,94,0.08)",
    accentBorder: "rgba(34,197,94,0.22)",
    tag: "Step 3",
    title: "Build every line yourself, with guidance",
    body: "For each milestone Mentivo explains the concept, then helps you write the code through questions — not by handing you the answer. The built-in editor runs live in the browser. No install, no setup, just build.",
    callout: "It won't move you forward until you genuinely get it.",
    preview: (
      <ScreenFrame
        src="/screenshots/learning page.png"
        alt="Mentivo milestone learning session with code editor"
        label="mentivo.app/dashboard/project/milestone/2"
        width={1024}
        height={516}
        maxH={260}
      />
    ),
  },
  {
    num: "04",
    accent: "#a855f7",
    accentMuted: "rgba(168,85,247,0.1)",
    accentBorder: "rgba(168,85,247,0.25)",
    tag: "Step 4",
    title: "Ship a project you can fully explain",
    body: "Once all milestones are done, you have a working, deployed app. Unlike a tutorial you copy-pasted, you understand every decision because you made every decision. You wrote every line.",
    callout: "One project. Every line yours. Zero confusion.",
    preview: (
      <div className="space-y-3">
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3.5"
          style={{
            background: "rgba(34,197,94,0.07)",
            border: "1px solid rgba(34,197,94,0.22)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-none mb-1">All milestones complete!</p>
            <p className="text-green-400 text-[11px] font-mono">expense-tracker.mentivo.app/alex</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { val: "7 / 7", label: "Milestones" },
            { val: "18", label: "Concepts learned" },
            { val: "340", label: "Lines written" },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl px-3 py-3 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-white text-sm font-black">{s.val}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: "rgba(168,85,247,0.07)",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <p className="text-violet-300 text-xs font-semibold mb-1">What a learner said:</p>
          <p className="text-slate-400 text-[12px] leading-relaxed italic">
            &ldquo;I built a real app and I can explain every line of it. That&apos;s never happened before.&rdquo;
          </p>
          <p className="text-slate-600 text-[11px] mt-2">— Alex, Built: Expense Tracker</p>
        </div>
      </div>
    ),
  },
];

/* ─── Component ─────────────────────────────────────────── */
export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ── Header fade-up ── */
      gsap.from(".hiw-header", {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".hiw-header",
          start: "top 90%",
          once: true,
        },
      });

      /* ── Each step fades in ── */
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, y: 40 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.85, ease: "power3.out",
          delay: i * 0.05,
          scrollTrigger: { trigger: el, start: "top bottom", once: true },
        });
      });

      /* ── Step number badges pop in ── */
      numRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { scale: 0, opacity: 0, rotation: -15 });
        gsap.to(el, {
          scale: 1, opacity: 1, rotation: 0,
          duration: 0.6, ease: "back.out(1.6)",
          delay: i * 0.05 + 0.1,
          scrollTrigger: { trigger: el, start: "top bottom", once: true },
        });
      });

      /* ── Parallax on the big background numbers ── */
      gsap.utils.toArray<HTMLElement>(".step-bg-num").forEach((el) => {
        gsap.to(el, {
          y: -60,
          ease: "none",
          scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
          },
        });
      });

      /* ── Horizontal scroll experience on desktop ── */
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        const track = trackRef.current;
        const steps = gsap.utils.toArray<HTMLElement>(".hiw-step");
        if (track && steps.length > 1 && sectionRef.current) {
          const total = steps.length;
          gsap.to(track, {
            xPercent: -100 * (total - 1),
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => `+=${window.innerWidth * (total - 0.5)}`,
              scrub: 1.1,
              pin: true,
              snap: 1 / (total - 1),
            },
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} id="how-it-works" className="relative py-28 overflow-hidden">
      {/* ── Section-wide subtle gradient ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6">
        {/* ── Header ── */}
        <div className="hiw-header text-center max-w-2xl mx-auto mb-20">
          <div className="section-label mx-auto w-fit mb-5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#f97316" }}
            />
            The process
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.06] mb-5">
            From idea to shipped app in{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #fb923c 0%, #f97316 60%, #ef4444 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              four steps.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            There's no setup friction and no copy paste confusion. Just a clear
            path from zero to a real, deployed project that you actually understand.
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="hiw-steps-container relative">
          <div
            ref={trackRef}
            className="hiw-track flex gap-6 lg:gap-10 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-4"
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                ref={(el) => { stepRefs.current[i] = el; }}
                className="hiw-step relative flex-shrink-0 w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[52vw] snap-center"
              >
                {/* ── Step card ── */}
                <div
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left: copy */}
                    <div className="p-7 lg:p-8 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-white/[0.05]">
                      {/* Step badge */}
                      <div className="flex items-center gap-3">
                        <div
                          ref={(el) => { numRefs.current[i] = el; }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px]"
                          style={{
                            background: step.accentMuted,
                            border: `1px solid ${step.accentBorder}`,
                            color: step.accent,
                          }}
                        >
                          {step.num}
                        </div>
                        <span
                          className="text-[11px] font-bold tracking-widest uppercase"
                          style={{ color: step.accent }}
                        >
                          {step.tag}
                        </span>
                      </div>

                      {/* Big background number (decorative) */}
                      <div className="relative">
                        <span
                          className="step-bg-num absolute -top-4 -left-2 text-[96px] font-black leading-none select-none pointer-events-none"
                          style={{
                            color: step.accentMuted,
                            opacity: 0.6,
                            filter: "blur(0px)",
                          }}
                        >
                          {step.num}
                        </span>
                        <h3 className="relative text-[19px] font-bold text-white leading-snug mb-3 pt-6">
                          {step.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-[1.7]">
                          {step.body}
                        </p>
                      </div>

                      {/* Callout */}
                      <div
                        className="flex items-start gap-2.5 rounded-xl px-4 py-3 mt-auto"
                        style={{
                          background: step.accentMuted,
                          border: `1px solid ${step.accentBorder}`,
                        }}
                      >
                        <svg
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: step.accent }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        <p
                          className="text-xs font-medium leading-relaxed"
                          style={{ color: step.accent }}
                        >
                          {step.callout}
                        </p>
                      </div>
                    </div>

                    {/* Right: visual */}
                    <div className="p-7 lg:p-8 flex flex-col justify-center">
                      {step.preview}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
