"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Header */
      gsap.set(".feat-header", { opacity: 0, y: 36 });
      gsap.to(".feat-header", {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".feat-header", start: "top bottom", once: true },
      });

      /* Individual card triggers — each card watches itself */
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, y: 50 });
        gsap.to(el, {
          opacity: 1, y: 0,
          duration: 0.75,
          ease: "power3.out",
          delay: (i % 3) * 0.08,
          scrollTrigger: { trigger: el, start: "top bottom", once: true },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const CARDS = [
    {
      accent: "#3b82f6",
      accentBg: "rgba(59,130,246,0.07)",
      accentBorder: "rgba(59,130,246,0.2)",
      accentText: "#93c5fd",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      badge: "#1 feature",
      title: "Your real idea, not a pre-made template",
      desc: "Tell Mentivo your idea in plain English. It asks a few questions to understand what you want and builds a focused first project around that, not something generic it picked for you.",
      span: "md:col-span-2",
      extra: (
        <div className="mt-5 bg-[#0d1117] rounded-xl border border-white/[0.06] p-4 space-y-2.5 text-xs font-mono">
          <div className="flex gap-2">
            <span className="text-orange-400 font-bold shrink-0">You</span>
            <span className="text-slate-400">&ldquo;I want to build a recipe sharing app&rdquo;</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 font-bold shrink-0">M</span>
            <span className="text-slate-300">
              Let&apos;s build an MVP with add, view, and delete recipes.
              Here&apos;s your <span className="text-blue-400">5 milestone plan.</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      accent: "#f97316",
      accentBg: "rgba(249,115,22,0.07)",
      accentBorder: "rgba(249,115,22,0.2)",
      accentText: "#fdba74",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      badge: null,
      title: "Teaches. Doesn't generate.",
      desc: "Instead of handing you the answer, Mentivo asks questions that guide you toward it. You work through the logic yourself and write every line of code.",
      span: "",
      extra: (
        <p className="mt-4 text-xs font-semibold" style={{ color: "#f97316" }}>
          → You can&apos;t progress without understanding
        </p>
      ),
    },
    {
      accent: "#22c55e",
      accentBg: "rgba(34,197,94,0.07)",
      accentBorder: "rgba(34,197,94,0.2)",
      accentText: "#86efac",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      badge: null,
      title: "Fully browser-based",
      desc: "Write, run, and preview your code right in the browser. No npm installs or terminal setup on day one. Just open it and start building.",
      span: "",
      extra: (
        <p className="mt-4 text-xs font-semibold" style={{ color: "#22c55e" }}>
          → Start in under 30 seconds
        </p>
      ),
    },
    {
      accent: "#a855f7",
      accentBg: "rgba(168,85,247,0.07)",
      accentBorder: "rgba(168,85,247,0.2)",
      accentText: "#d8b4fe",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      badge: null,
      title: "Milestone by milestone progress",
      span: "md:col-span-2",
      desc: "Your project is split into 4 to 8 achievable milestones. Each one teaches a concept, has you write the code, and checks your understanding before moving you to the next step.",
      extra: (
        <div className="mt-5 space-y-2">
          {[
            { label: "HTML Structure", state: "done" },
            { label: "React Components", state: "active" },
            { label: "State & Events", state: "todo" },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                m.state === "done" ? "bg-green-500/15 border border-green-500/35 text-green-400"
                : m.state === "active" ? "bg-violet-500/15 border border-violet-500/40 text-violet-400"
                : "bg-white/4 border border-white/10 text-slate-600"
              }`}>
                {m.state === "done" ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium ${
                m.state === "done" ? "text-slate-500 line-through"
                : m.state === "active" ? "text-white"
                : "text-slate-600"
              }`}>{m.label}</span>
              {m.state === "active" && (
                <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5 ml-auto">
                  in progress
                </span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      accent: "#06b6d4",
      accentBg: "rgba(6,182,212,0.07)",
      accentBorder: "rgba(6,182,212,0.2)",
      accentText: "#67e8f9",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      badge: null,
      title: "Adapts to your level",
      desc: "Mentivo starts with a short conversational check. If you're a complete beginner it starts from the very basics. If you have some experience it skips ahead to where you actually need help.",
      span: "",
      extra: (
        <p className="mt-4 text-xs font-semibold" style={{ color: "#06b6d4" }}>
          → No assumed knowledge
        </p>
      ),
    },
    {
      accent: "#f43f5e",
      accentBg: "rgba(244,63,94,0.07)",
      accentBorder: "rgba(244,63,94,0.2)",
      accentText: "#fda4af",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: null,
      title: "Real comprehension checks",
      desc: "After each concept, Mentivo gives you a real coding exercise to extend or explain what you just learned. Not multiple choice. An actual task that shows you understood it.",
      span: "",
      extra: (
        <p className="mt-4 text-xs font-semibold" style={{ color: "#f43f5e" }}>
          → You can&apos;t fake understanding
        </p>
      ),
    },
  ];

  return (
    <section ref={sectionRef} id="features" className="relative py-28 px-6">
      {/* Header */}
      <div className="feat-header max-w-3xl mx-auto text-center mb-14">
        <div className="section-label mx-auto w-fit mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          What makes it different
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.08] mb-4">
          Built for people who want to{" "}
          <span className="gradient-text-blue">actually understand</span>{" "}
          what they&apos;re building
        </h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          Mentivo is not a tutorial site and it does not write code for you.
          It is an AI mentor that meets you where you are and genuinely
          helps you understand how to build things.
        </p>
      </div>

      {/* Bento grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map((card, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 group ${card.span}`}
            style={{
              background: card.accentBg,
              border: `1px solid ${card.accentBorder}`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: card.accentBg, border: `1px solid ${card.accentBorder}`, color: card.accent }}
              >
                {card.icon}
              </div>
              {card.badge && (
                <span
                  className="text-[11px] font-semibold rounded-full px-2.5 py-1"
                  style={{ color: card.accent, background: card.accentBg, border: `1px solid ${card.accentBorder}` }}
                >
                  {card.badge}
                </span>
              )}
            </div>
            <h3 className="text-[16px] font-bold text-white mb-2 leading-snug">
              {card.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
            {card.extra}
          </div>
        ))}
      </div>
    </section>
  );
}
