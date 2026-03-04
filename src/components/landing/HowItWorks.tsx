"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Step data ─────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    accent: "#3b82f6",
    accentMuted: "rgba(59,130,246,0.12)",
    accentBorder: "rgba(59,130,246,0.25)",
    tag: "Step 1",
    title: "Describe what you want to build",
    body: "Open Mentivo and describe your idea in plain English. It asks a few questions to understand what you want and, if the scope is too big, it suggests a focused version you can actually finish.",
    callout: "Your idea, not a pre-made template.",
    preview: (
      <div className="space-y-2.5 text-xs font-mono bg-[#0d1117] rounded-xl border border-white/[0.06] p-4">
        <div className="flex gap-2.5">
          <span className="text-orange-400 font-bold shrink-0 w-6">You</span>
          <span className="text-slate-400">&ldquo;I want to build a habit tracker app&rdquo;</span>
        </div>
        <div className="flex gap-2.5">
          <span className="text-blue-400 font-bold shrink-0 w-6">M</span>
          <span className="text-slate-300">Should it track daily or weekly habits? Do you want data to persist across sessions?</span>
        </div>
        <div className="flex gap-2.5">
          <span className="text-orange-400 font-bold shrink-0 w-6">You</span>
          <span className="text-slate-400">Daily habits, yes I want them saved.</span>
        </div>
        <div className="flex gap-2.5">
          <span className="text-blue-400 font-bold shrink-0 w-6">M</span>
          <span className="text-slate-300">
            Perfect. Here&apos;s your{" "}
            <span className="text-blue-400 font-semibold">5-milestone MVP plan</span>. Ready to start?
          </span>
        </div>
      </div>
    ),
  },
  {
    num: "02",
    accent: "#f97316",
    accentMuted: "rgba(249,115,22,0.1)",
    accentBorder: "rgba(249,115,22,0.25)",
    tag: "Step 2",
    title: "Get a path matched to your level",
    body: "Mentivo starts with a short conversational check. No tests, just a few questions. It figures out what you already know and builds a sequence of milestones that teaches exactly what you need in the right order.",
    callout: "Complete beginner? It starts with what HTML even is.",
    preview: (
      <div className="space-y-2.5">
        {[
          { label: "HTML structure", state: "done" },
          { label: "CSS styling", state: "done" },
          { label: "JavaScript basics", state: "active" },
          { label: "React components", state: "todo" },
          { label: "Persistent storage", state: "todo" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                item.state === "done"
                  ? "bg-green-500/15 border border-green-500/35 text-green-400"
                  : item.state === "active"
                  ? "bg-orange-500/15 border border-orange-500/40 text-orange-400"
                  : "bg-white/4 border border-white/10 text-slate-600"
              }`}
            >
              {item.state === "done" ? "✓" : i + 1}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span
                className={`text-xs font-medium ${
                  item.state === "done"
                    ? "text-slate-500 line-through"
                    : item.state === "active"
                    ? "text-white"
                    : "text-slate-600"
                }`}
              >
                {item.label}
              </span>
              {item.state === "active" && (
                <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
                  up next
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: "03",
    accent: "#22c55e",
    accentMuted: "rgba(34,197,94,0.08)",
    accentBorder: "rgba(34,197,94,0.22)",
    tag: "Step 3",
    title: "Build with guidance. Every line is yours.",
    body: "For each milestone, Mentivo explains the concept in plain English and then helps you write the code through questions rather than just handing you the answer. The built-in browser editor means there's nothing to install.",
    callout: "It won't move you forward until you genuinely get it.",
    preview: (
      <div className="bg-[#0d1117] rounded-xl border border-white/[0.06] overflow-hidden text-xs font-mono">
        <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <div className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-slate-600 text-[10px]">App.jsx / Milestone 3</span>
        </div>
        <div className="p-3 space-y-0.5">
          {[
            [{ t: "import", c: "tok-kw" }, { t: " { useState } from ", c: "tok-op" }, { t: "'react'", c: "tok-str" }],
            [],
            [{ t: "export default ", c: "tok-kw" }, { t: "function", c: "tok-kw" }, { t: " App", c: "tok-fn" }, { t: "() {", c: "tok-op" }],
            [{ t: "  ", c: "tok-plain" }, { t: "const", c: "tok-kw" }, { t: " [habits, setHabits] = ", c: "tok-op" }, { t: "useState", c: "tok-fn" }, { t: "([])", c: "tok-op" }],
            [{ t: "  ", c: "tok-plain" }, { t: "// ← your code here", c: "tok-cmt" }],
          ].map((line, li) => (
            <div key={li} className="flex gap-2.5">
              <span className="text-slate-700 w-3 text-right leading-5 text-[10px] shrink-0">{li + 1}</span>
              <span className="leading-5">
                {line.map((tok, ti) => (
                  <span key={ti} className={tok.c}>{tok.t}</span>
                ))}
                {li === 4 && <span className="ide-cursor" />}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.05] px-3 py-2">
          <div className="flex gap-2 items-start">
            <div className="w-4 h-4 rounded-[4px] bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-400 shrink-0 mt-0.5">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3" />
              </svg>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Now that you have <span className="text-green-400">useState</span>, how would you add a new habit to that array?
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    num: "04",
    accent: "#a855f7",
    accentMuted: "rgba(168,85,247,0.1)",
    accentBorder: "rgba(168,85,247,0.25)",
    tag: "Step 4",
    title: "Ship a project you can explain",
    body: "When all milestones are complete, you have a working, deployed app. And unlike a tutorial you followed along with, you understand every line because you wrote every line yourself.",
    callout: "One-click deploy. Share the link. Show your work.",
    preview: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-green-500/6 border border-green-500/20 rounded-xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/12 border border-green-500/25 flex items-center justify-center text-green-400 shrink-0">
            <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-white text-xs font-bold">Project complete!</p>
            <p className="text-green-400 text-[11px] font-mono">habit-tracker.mentivo.app/alex</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: "5/5", label: "Milestones" },
            { val: "14", label: "Concepts" },
            { val: "203", label: "Lines written" },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-center">
              <p className="text-white text-sm font-black">{s.val}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-[11px] text-center italic">
          &ldquo;I built a real app. And I can explain every line of it.&rdquo;
        </p>
      </div>
    ),
  },
];

/* ─── Component ─────────────────────────────────────────── */
export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
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

      /* ── Timeline line draws down with scrub ── */
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top center",
            scrollTrigger: {
              trigger: ".hiw-steps-container",
              start: "top 70%",
              end: "bottom 60%",
              scrub: 0.6,
            },
          }
        );
      }

      /* ── Each step slides in ── */
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, x: 60, y: 20 });
        gsap.to(el, {
          opacity: 1, x: 0, y: 0,
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
          {/* Connecting timeline line */}
          <div className="absolute left-[27px] top-8 bottom-8 w-px bg-white/[0.05] hidden lg:block">
            <div
              ref={lineRef}
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(to bottom, #3b82f6, #f97316, #22c55e, #a855f7)",
              }}
            />
          </div>

          <div className="space-y-7">
            {STEPS.map((step, i) => (
              <div
                key={i}
                ref={(el) => { stepRefs.current[i] = el; }}
                className="relative grid lg:grid-cols-[56px_1fr] gap-5 lg:gap-8 items-start"
              >
                {/* ── Number badge (left column on desktop) ── */}
                <div
                  ref={(el) => { numRefs.current[i] = el; }}
                  className="hidden lg:flex flex-col items-center gap-1 pt-1"
                >
                  <div
                    className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center font-black text-[13px] tracking-wider z-10 relative shadow-lg"
                    style={{
                      background: step.accentMuted,
                      border: `1px solid ${step.accentBorder}`,
                      color: step.accent,
                      boxShadow: `0 0 20px ${step.accentMuted}`,
                    }}
                  >
                    {step.num}
                  </div>
                </div>

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
                      {/* Mobile step badge */}
                      <div className="flex items-center gap-3 lg:hidden">
                        <div
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

                      {/* Desktop step tag */}
                      <span
                        className="hidden lg:inline-flex text-[11px] font-bold tracking-widest uppercase w-fit"
                        style={{ color: step.accent }}
                      >
                        {step.tag}
                      </span>

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
