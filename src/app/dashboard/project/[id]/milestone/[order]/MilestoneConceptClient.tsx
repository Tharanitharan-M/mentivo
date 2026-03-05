"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import gsap from "gsap";

interface Props {
  project: { id: string; title: string; idea: string; level: string | null };
  milestone: {
    id: string;
    order: number;
    title: string;
    concept: string;
    description: string;
    estimatedTime: string;
    difficulty: string;
    tags: string[];
    cachedContent: string | null;
  };
  totalMilestones: number;
  nextMilestone: { order: number; title: string } | null;
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

export default function MilestoneConceptClient({ project, milestone, totalMilestones, nextMilestone }: Props) {
  const [content, setContent] = useState<string>(milestone.cachedContent ?? "");
  const [isLoading, setIsLoading] = useState(!milestone.cachedContent);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const level = project.level ?? "beginner";
  const gradient = LEVEL_GRADIENT[level] ?? LEVEL_GRADIENT.beginner;
  const diff = DIFFICULTY_STYLE[milestone.difficulty] ?? DIFFICULTY_STYLE.easy;
  const progress = (milestone.order / totalMilestones) * 100;

  // Fetch concept if not cached
  useEffect(() => {
    if (milestone.cachedContent) return;

    const generate = async () => {
      try {
        const res = await fetch("/api/milestone/concept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ milestoneId: milestone.id, projectId: project.id }),
        });
        const data = await res.json();
        if (data.content) setContent(data.content);
        else setError(true);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, [milestone.id, milestone.cachedContent, project.id]);

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const headerEls = headerRef.current?.querySelectorAll("[data-anim]");
      if (headerEls) {
        gsap.fromTo(
          headerEls,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.1 }
        );
      }
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.4 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#07080f]">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse, #3b82f6 0%, transparent 65%)", filter: "blur(70px)" }}
      />

      {/* ── Nav header ────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-[#07080f]/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/project/${project.id}/roadmap`}
              className="text-slate-500 hover:text-white transition-colors"
            >
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 hidden sm:block">
              {milestone.order} / {totalMilestones}
            </span>
            {/* Progress pill */}
            <div className="w-24 h-1.5 rounded-full bg-white/[0.07] overflow-hidden hidden sm:block">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 relative z-10">
        {/* ── Milestone header ──────────────────────────────────────── */}
        <div ref={headerRef} className="mb-10">
          <div data-anim className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">
              Milestone {milestone.order}
            </span>
            <span className="text-slate-700">·</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.bg} ${diff.border} ${diff.text}`}>
              {milestone.difficulty}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-600">{milestone.estimatedTime}</span>
          </div>

          <h1 data-anim className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
            {milestone.title}
          </h1>

          <p data-anim className="text-slate-400 text-base leading-relaxed mb-5">
            {milestone.description}
          </p>

          {/* Concept + tags row */}
          <div data-anim className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/[0.08] border border-blue-500/20">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-semibold text-blue-300">{milestone.concept}</span>
            </div>
            {milestone.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="hr-gradient mb-10" />

        {/* ── Concept content ───────────────────────────────────────── */}
        <div ref={contentRef}>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400 text-sm mb-8">
                <svg className="w-4 h-4 animate-spin text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Mentivo is writing your concept guide...
              </div>
              {/* Skeleton lines */}
              {[1, 0.9, 0.75, 1, 0.85, 0.6].map((w, i) => (
                <div
                  key={i}
                  className="h-4 rounded-full bg-white/[0.04] animate-pulse"
                  style={{ width: `${w * 100}%`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm mb-4">Couldn&apos;t load the concept guide. Please try again.</p>
              <button
                onClick={() => { setError(false); setIsLoading(true); }}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="prose-mentivo">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-white mt-10 mb-3 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold text-slate-200 mt-6 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-400 leading-relaxed mb-4 text-[15px]">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 mb-5 ml-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-2 mb-5 ml-1 list-decimal list-inside">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-400 text-[15px] leading-relaxed flex items-start gap-2">
                      <span className="text-blue-400 mt-1.5 flex-shrink-0">·</span>
                      <span>{children}</span>
                    </li>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) {
                      return (
                        <code className="block text-sm font-mono text-slate-300 leading-relaxed">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="text-sm font-mono text-blue-300 bg-blue-500/[0.1] border border-blue-500/20 px-1.5 py-0.5 rounded-md">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-[#0d0f1a] border border-white/[0.08] rounded-xl p-5 overflow-x-auto my-5 text-sm">
                      {children}
                    </pre>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-slate-200 font-semibold">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-blue-500/40 pl-4 my-4 text-slate-500 italic text-sm">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <div className="hr-gradient my-8" />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}

          {/* ── Bottom navigation ──────────────────────────────────── */}
          {!isLoading && !error && (
            <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3">
              <Link
                href={`/dashboard/project/${project.id}/roadmap`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] text-slate-300 hover:text-white text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Back to Roadmap
              </Link>
              {nextMilestone ? (
                <Link
                  href={`/dashboard/project/${project.id}/milestone/${nextMilestone.order}`}
                  className={`flex-1 flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]`}
                >
                  <span className="flex flex-col items-start">
                    <span className="text-[10px] font-medium opacity-70 uppercase tracking-wider">Next Milestone</span>
                    <span className="truncate max-w-[200px]">{nextMilestone.title}</span>
                  </span>
                  <svg className="w-4 h-4 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-semibold`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All concepts covered!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
