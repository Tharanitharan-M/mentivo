"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Feature = {
  icon: React.ReactNode;
  flag?: string;
  title: string;
  desc: string;
  span?: string;
  extra?: React.ReactNode;
  accent?: boolean;
};

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".feat-header > *", { opacity: 0, y: 16 });
      gsap.to(".feat-header > *", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: ".feat-header", start: "top 88%", once: true },
      });

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, y: 24 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          delay: (i % 3) * 0.06,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const CARDS: Feature[] = [
    {
      flag: "Lead feature",
      accent: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: "Your real idea, not a pre-made template",
      desc: "Tell Mentivo your idea in plain English. It asks a few questions to understand what you want, then builds a focused first project around that — not something generic it picked for you.",
      span: "md:col-span-2",
      extra: (
        <div className="mt-5 bg-[#0f0d0c] rounded-xl border border-[var(--border)] p-4 space-y-2.5 text-xs font-mono">
          <div className="flex gap-2">
            <span className="text-stone-500 font-semibold shrink-0">You</span>
            <span className="text-stone-300">&ldquo;I want to build a recipe sharing app&rdquo;</span>
          </div>
          <div className="flex gap-2">
            <span className="text-amber-400 font-semibold shrink-0">M</span>
            <span className="text-stone-300">
              Let&apos;s build an MVP with add, view, and delete recipes.
              Here&apos;s your <span className="text-amber-400">5-milestone plan.</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Teaches. Doesn't generate.",
      desc: "Instead of handing you the answer, Mentivo asks questions that guide you toward it. You work through the logic yourself and write every line.",
      extra: (
        <p className="mt-5 text-[13px] text-amber-400 font-medium inline-flex items-center gap-2">
          <span className="w-3 h-px bg-amber-400" />
          You can&apos;t progress without understanding
        </p>
      ),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: "Fully browser-based",
      desc: "Write, run, and preview your code right in the browser. No npm installs or terminal setup on day one — open it and start building.",
      extra: (
        <p className="mt-5 text-[13px] text-amber-400 font-medium inline-flex items-center gap-2">
          <span className="w-3 h-px bg-amber-400" />
          Start in under 30 seconds
        </p>
      ),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: "Milestone-by-milestone progress",
      desc: "Your project is split into 4 to 8 achievable milestones. Each one teaches a concept, has you write the code, and checks your understanding before unlocking the next.",
      span: "md:col-span-2",
      extra: (
        <div className="mt-5 space-y-2.5">
          {[
            { label: "HTML structure", state: "done" },
            { label: "React components", state: "active" },
            { label: "State & events", state: "todo" },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  m.state === "done"
                    ? "bg-stone-50/10 border border-stone-50/20 text-stone-300"
                    : m.state === "active"
                    ? "bg-amber-500/15 border border-amber-500/45 text-amber-300"
                    : "bg-transparent border border-[var(--border)] text-stone-600"
                }`}
              >
                {m.state === "done" ? "✓" : i + 1}
              </div>
              <span
                className={`text-[13px] font-medium ${
                  m.state === "done"
                    ? "text-stone-500 line-through"
                    : m.state === "active"
                    ? "text-stone-50"
                    : "text-stone-600"
                }`}
              >
                {m.label}
              </span>
              {m.state === "active" && (
                <span className="text-[10px] font-semibold tracking-wide uppercase text-amber-400 ml-auto">
                  in progress
                </span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Adapts to your level",
      desc: "Mentivo starts with a short conversational check. A complete beginner gets the basics. If you have some experience, it skips ahead.",
      extra: (
        <p className="mt-5 text-[13px] text-amber-400 font-medium inline-flex items-center gap-2">
          <span className="w-3 h-px bg-amber-400" />
          No assumed knowledge
        </p>
      ),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Real comprehension checks",
      desc: "After each concept, Mentivo gives you a coding exercise that extends or explains what you just learned. Not multiple choice — an actual task that proves you understood it.",
      extra: (
        <p className="mt-5 text-[13px] text-amber-400 font-medium inline-flex items-center gap-2">
          <span className="w-3 h-px bg-amber-400" />
          You can&apos;t fake understanding
        </p>
      ),
    },
  ];

  return (
    <section ref={sectionRef} id="features" className="relative py-28 px-6">
      {/* Header */}
      <div className="feat-header max-w-3xl mx-auto text-center mb-16">
        <div className="eyebrow eyebrow-center mx-auto w-fit mb-6">
          What makes it different
        </div>
        <h2
          className="text-stone-50 font-semibold tracking-[-0.03em] mb-5"
          style={{ fontSize: "clamp(30px, 3.6vw, 44px)", lineHeight: 1.08 }}
        >
          Built for people who want to{" "}
          <span className="text-amber-400">actually understand</span>{" "}
          what they&apos;re building
        </h2>
        <p className="text-stone-400 text-[16px] max-w-xl mx-auto leading-[1.7]">
          Mentivo isn&apos;t a tutorial site, and it doesn&apos;t write code for
          you. It&apos;s an AI mentor that meets you where you are.
        </p>
      </div>

      {/* Bento grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3">
        {CARDS.map((card, i) => (
          <div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={`surface-card p-7 group ${card.span ?? ""}`}
            style={
              card.accent
                ? {
                    background:
                      "linear-gradient(180deg, rgba(245,158,11,0.04) 0%, rgba(250,250,249,0.025) 50%)",
                    borderColor: "rgba(245,158,11,0.18)",
                  }
                : undefined
            }
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  card.accent
                    ? "bg-amber-500/12 border border-amber-500/30 text-amber-400"
                    : "bg-[var(--surface)] border border-[var(--border)] text-stone-300"
                }`}
              >
                {card.icon}
              </div>
              {card.flag && (
                <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-amber-400">
                  {card.flag}
                </span>
              )}
            </div>
            <h3 className="text-stone-50 text-[16px] font-semibold leading-snug tracking-[-0.01em] mb-2.5">
              {card.title}
            </h3>
            <p className="text-stone-400 text-[14px] leading-[1.65]">
              {card.desc}
            </p>
            {card.extra}
          </div>
        ))}
      </div>
    </section>
  );
}
