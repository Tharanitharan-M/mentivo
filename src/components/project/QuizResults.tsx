"use client";

import Image from "next/image";
import Link from "next/link";

interface QuizResult {
  level: string;
  levelLabel: string;
  summary: string;
  strengths: string[];
  focusAreas: string[];
  encouragement: string;
  nextStep: string;
}

interface Props {
  result: QuizResult | null;
  projectIdea: string;
  existingQuiz: {
    questions: unknown[];
    answers: Record<string, string>;
    score: number | null;
    level: string | null;
  } | null;
  userName: string;
}

const LEVEL_CONFIG: Record<string, { gradient: string; glow: string; border: string; badge: string }> = {
  beginner: {
    gradient: "from-sky-400 to-blue-500",
    glow: "rgba(56, 189, 248, 0.15)",
    border: "border-sky-500/20",
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  },
  intermediate: {
    gradient: "from-orange-400 to-amber-500",
    glow: "rgba(251, 146, 60, 0.15)",
    border: "border-orange-500/20",
    badge: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  },
  advanced: {
    gradient: "from-purple-400 to-violet-500",
    glow: "rgba(167, 139, 250, 0.15)",
    border: "border-purple-500/20",
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  },
};

export default function QuizResults({ result, projectIdea, existingQuiz, userName }: Props) {
  const level = result?.level ?? existingQuiz?.level ?? "beginner";
  const levelLabel = result?.levelLabel ?? "Explorer";
  const summary = result?.summary ?? "Your personalized learning path is ready.";
  const strengths = result?.strengths ?? [];
  const focusAreas = result?.focusAreas ?? [];
  const encouragement = result?.encouragement ?? "You've got this!";
  const nextStep = result?.nextStep ?? "Let's start your learning journey.";

  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.beginner;

  return (
    <div className="min-h-screen bg-[#07080f] flex flex-col">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-[0.1]"
        style={{ background: `radial-gradient(ellipse, ${cfg.glow} 0%, transparent 65%)`, filter: "blur(60px)" }}
      />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#07080f]/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 h-[56px] flex items-center justify-between">
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
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-slate-500 font-medium">Assessment complete</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 relative z-10">
        <div className="w-full max-w-xl space-y-5">
          {/* Level reveal card */}
          <div className={`rounded-2xl border ${cfg.border} bg-white/[0.02] p-7 text-center relative overflow-hidden`}>
            {/* Subtle gradient glow behind */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ background: `radial-gradient(ellipse at top, ${cfg.glow}, transparent 70%)` }}
            />

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/[0.08] mb-5">
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-green-400">Assessment complete</span>
            </div>

            <div className="mb-4">
              <span
                className={`text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}
              >
                {levelLabel}
              </span>
            </div>

            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${cfg.badge} uppercase tracking-wider mb-4`}>
              {level} level
            </span>

            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
              {summary}
            </p>
          </div>

          {/* Strengths + Focus areas */}
          <div className="grid grid-cols-2 gap-4">
            {strengths.length > 0 && (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-green-500/10 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Strengths</span>
                </div>
                <ul className="space-y-1.5">
                  {strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">·</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {focusAreas.length > 0 && (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">We&apos;ll Focus On</span>
                </div>
                <ul className="space-y-1.5">
                  {focusAreas.map((f, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5">·</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Project idea reminder */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3 flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-0.5">Your project</p>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{projectIdea}</p>
            </div>
          </div>

          {/* Encouragement + Next step */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 text-center">
            <p className="text-white font-semibold text-sm mb-1">{encouragement}</p>
            <p className="text-slate-500 text-xs leading-relaxed">{nextStep}</p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]`}
            >
              Start Learning
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
