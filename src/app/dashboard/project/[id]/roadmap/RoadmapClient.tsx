"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Milestone {
  id: string;
  order: number;
  title: string;
  description: string;
  concept: string;
  estimatedTime: string;
  difficulty: string;
  tags: string[];
  status: string;
}

interface Props {
  project: { id: string; title: string; idea: string; level: string | null };
  milestones: Milestone[];
  userName: string;
}

const DIFFICULTY_STYLE: Record<string, { text: string; bg: string; border: string }> = {
  easy:   { text: "text-green-400",  bg: "bg-green-400/[0.07]",  border: "border-green-400/20"  },
  medium: { text: "text-orange-400", bg: "bg-orange-400/[0.07]", border: "border-orange-400/20" },
  hard:   { text: "text-purple-400", bg: "bg-purple-400/[0.07]", border: "border-purple-400/20" },
};

const LEVEL_GRADIENT: Record<string, string> = {
  beginner:     "from-sky-400 to-blue-500",
  intermediate: "from-orange-400 to-amber-500",
  advanced:     "from-purple-400 to-violet-500",
};

function totalHours(milestones: Milestone[]): string {
  const total = milestones.reduce((acc, m) => {
    const match = m.estimatedTime.match(/(\d+)/);
    return acc + (match ? parseInt(match[1]) : 2);
  }, 0);
  return `${total}–${total + milestones.length} hours`;
}

export default function RoadmapClient({ project, milestones, userName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const level = project.level ?? "beginner";
  const gradient = LEVEL_GRADIENT[level] ?? LEVEL_GRADIENT.beginner;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Hero entrance ──────────────────────────────────────────────
      const heroEls = heroRef.current?.querySelectorAll("[data-anim]");
      if (heroEls) {
        gsap.fromTo(
          heroEls,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.1,
          }
        );
      }

      // ── Timeline line draw ─────────────────────────────────────────
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            duration: 1.4,
            ease: "power2.inOut",
            delay: 0.5,
          }
        );
      }

      // ── Milestone nodes + cards stagger ───────────────────────────
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const isEven = i % 2 === 0;

        gsap.fromTo(
          card,
          { opacity: 0, x: isEven ? -40 : 40, y: 10 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            delay: 0.6 + i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;
        gsap.fromTo(
          node,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)",
            delay: 0.65 + i * 0.1,
            scrollTrigger: {
              trigger: node,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#07080f]">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse, #3b82f6 0%, transparent 60%)", filter: "blur(80px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 w-[500px] h-[400px] opacity-[0.04]"
        style={{ background: "radial-gradient(ellipse, #a78bfa 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-[#07080f]/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="w-px h-4 bg-white/[0.08]" />
            <Link href="/" className="flex items-center gap-1.5">
              <Image src="/logo-mark.png" alt="Mentivo" width={22} height={22} className="rounded-md" />
              <span className="font-semibold text-sm text-white tracking-[-0.02em]">Mentivo</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Your Learning Roadmap</span>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="max-w-4xl mx-auto px-5 sm:px-8 pt-14 pb-12 text-center relative z-10">
        <div data-anim className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/[0.07] mb-6">
          <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-xs font-medium text-blue-400">Personalized Roadmap</span>
        </div>

        <h1 data-anim className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
          Your path to building<br />
          <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {project.title.length > 50 ? project.title.slice(0, 50) + "..." : project.title}
          </span>
        </h1>

        <p data-anim className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-8">
          {milestones.length} milestones crafted for your{" "}
          <span className="text-slate-200 font-medium capitalize">{level}</span> level ·{" "}
          <span className="text-slate-200 font-medium">{totalHours(milestones)}</span> of focused learning
        </p>

        {/* Stats row */}
        <div data-anim className="inline-flex items-center gap-1 divide-x divide-white/[0.07] bg-white/[0.03] border border-white/[0.07] rounded-2xl px-2 py-1 mb-2">
          {[
            { label: "Milestones", value: milestones.length.toString() },
            { label: "Est. hours", value: totalHours(milestones) },
            { label: "Level", value: level.charAt(0).toUpperCase() + level.slice(1) },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-4 py-1.5">
              <span className="text-base font-bold text-white">{stat.value}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pb-24 relative z-10">
        <div className="relative">
          {/* Vertical line */}
          <div
            ref={lineRef}
            className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/60 via-blue-500/20 to-transparent"
            style={{ transformOrigin: "top center" }}
          />

          <div className="space-y-6">
            {milestones.map((milestone, i) => {
              const isEven = i % 2 === 0;
              const diff = DIFFICULTY_STYLE[milestone.difficulty] ?? DIFFICULTY_STYLE.easy;
              const isCompleted = milestone.status === "COMPLETED";
              const isInProgress = milestone.status === "IN_PROGRESS";

              return (
                <div
                  key={milestone.id}
                  className={`relative flex items-start gap-0 sm:gap-8 ${
                    isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                  } flex-row pl-16 sm:pl-0`}
                >
                  {/* ── Node ── */}
                  <div
                    ref={(el) => { nodeRefs.current[i] = el; }}
                    className={`absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-5 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg z-10 border-2 ${
                      isCompleted
                        ? "bg-green-500/10 border-green-500/40 text-green-400"
                        : isInProgress
                        ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                        : i === 0
                        ? `bg-gradient-to-br ${gradient} border-white/20 text-white shadow-lg`
                        : "bg-[#0d0f1a] border-white/[0.12] text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isInProgress ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : i === 0 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : (
                      <span>{milestone.order}</span>
                    )}
                  </div>

                  {/* ── Card ── */}
                  <div
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className={`w-full sm:w-[calc(50%-2rem)] group`}
                  >
                    <div className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isCompleted
                        ? "border-green-500/20 bg-green-500/[0.03] hover:border-green-500/30"
                        : isInProgress
                        ? "border-blue-500/20 bg-blue-500/[0.03] hover:border-blue-500/30"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-blue-500/25 hover:bg-white/[0.035]"
                    }`}>
                      {/* Top accent line */}
                      <div className={`h-[2px] w-full ${isCompleted ? "bg-gradient-to-r from-green-400 to-emerald-500" : `bg-gradient-to-r ${gradient} opacity-40`}`} />

                      <div className="p-5">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                                Milestone {milestone.order}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.border} ${diff.text}`}>
                                {milestone.difficulty}
                              </span>
                              {isCompleted && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-green-500/10 border-green-500/25 text-green-400">
                                  ✓ Completed
                                </span>
                              )}
                              {isInProgress && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-500/10 border-blue-500/25 text-blue-400">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <h3 className={`font-bold text-base leading-snug ${isCompleted ? "text-green-200" : "text-white"}`}>
                              {milestone.title}
                            </h3>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className="text-xs text-slate-600">{milestone.estimatedTime}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                          {milestone.description}
                        </p>

                        {/* Concept badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/[0.08] border border-blue-500/20">
                            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="text-xs font-semibold text-blue-300">{milestone.concept}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {milestone.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <Link
                          href={`/dashboard/project/${project.id}/milestone/${milestone.order}`}
                          className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl border transition-all ${
                            isCompleted
                              ? "bg-green-500/[0.07] border-green-500/20 hover:bg-green-500/[0.12]"
                              : `bg-gradient-to-r ${gradient} bg-opacity-10 border-white/[0.08] group-hover:border-blue-500/20`
                          }`}
                        >
                          <span className={`text-sm font-semibold ${isCompleted ? "text-green-300" : "text-white"}`}>
                            {isCompleted ? "Review & revisit" : isInProgress ? "Continue building" : "Start this milestone"}
                          </span>
                          <svg className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${isCompleted ? "text-green-400/70" : "text-white/70"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Finish marker */}
            <div className="relative flex justify-center pt-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-green-400 font-bold text-sm">Project Complete 🚀</p>
                  <p className="text-slate-600 text-xs mt-0.5">You&apos;ve got everything you need to ship this.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
