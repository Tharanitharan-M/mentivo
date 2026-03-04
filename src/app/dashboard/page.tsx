"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  idea: string;
  status: string;
  level: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ONBOARDING: { label: "In Progress", color: "text-blue-400", dot: "bg-blue-400" },
  QUIZ: { label: "Quiz", color: "text-orange-400", dot: "bg-orange-400 animate-pulse" },
  ACTIVE: { label: "Learning", color: "text-green-400", dot: "bg-green-400" },
  COMPLETED: { label: "Completed", color: "text-purple-400", dot: "bg-purple-400" },
};

const LEVEL_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  beginner: { label: "Beginner", bg: "bg-sky-500/10 border-sky-500/20", text: "text-sky-400" },
  intermediate: { label: "Intermediate", bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-400" },
  advanced: { label: "Advanced", bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400" },
};

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}! ☀️`;
  if (hour < 18) return `Good afternoon, ${name}!`;
  return `Good evening, ${name}! 🌙`;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/projects")
        .then((r) => r.json())
        .then((data) => {
          setProjects(data.projects ?? []);
          setLoadingProjects(false);
        })
        .catch(() => setLoadingProjects(false));
    }
  }, [session]);

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      const data = await res.json();
      if (data.project?.id) {
        router.push(`/dashboard/project/${data.project.id}`);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleIdeaSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#07080f] flex items-center justify-center">
        <svg className="w-6 h-6 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const firstName = user.name?.split(" ")[0] ?? "there";
  const initial = user.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-[#07080f]">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-[0.07]"
        style={{ background: "radial-gradient(ellipse at center, #3b82f6 0%, transparent 65%)", filter: "blur(60px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 w-[600px] h-[400px] opacity-[0.04]"
        style={{ background: "radial-gradient(ellipse at center, #a78bfa 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#07080f]/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-mark.png" alt="Mentivo" width={30} height={30} className="rounded-lg" />
            <span className="font-bold text-[15px] text-white tracking-[-0.02em]">Mentivo</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]">
              {user.image ? (
                <Image src={user.image} alt={user.name ?? "User"} width={22} height={22} className="rounded-full" />
              ) : (
                <div className="w-[22px] h-[22px] rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[11px] font-semibold text-blue-400">
                  {initial}
                </div>
              )}
              <span className="text-sm text-slate-300 font-medium">{user.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-12 relative z-10">
        {/* Welcome */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-500/20 bg-green-500/[0.07] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400">Ready to build</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            {getGreeting(firstName)}
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Share your project idea and I&apos;ll build you a{" "}
            <span className="text-slate-200 font-medium">personalized learning path</span> to bring it to life.
          </p>
        </div>

        {/* Idea Input Box */}
        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleIdeaSubmit}>
            <div className="relative rounded-2xl border border-white/[0.1] bg-white/[0.03] focus-within:border-blue-500/40 focus-within:bg-white/[0.04] transition-all duration-200"
              style={{ boxShadow: "0 0 0 1px transparent, 0 4px 32px rgba(0,0,0,0.3)" }}
            >
              <textarea
                ref={textareaRef}
                value={idea}
                onChange={(e) => { setIdea(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder="Describe your project idea... e.g. &quot;I want to build an expense tracker that helps me understand where my money goes each month&quot;"
                rows={3}
                className="w-full bg-transparent text-white placeholder:text-slate-500 text-[15px] leading-relaxed resize-none px-5 pt-4 pb-2 outline-none font-sans"
                style={{ maxHeight: 200 }}
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between px-4 pb-3 pt-1">
                <span className="text-xs text-slate-600">Press Enter to send · Shift+Enter for new line</span>
                <button
                  type="submit"
                  disabled={!idea.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      Let&apos;s build
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Suggestion chips */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {[
              "A budgeting app for students",
              "A recipe finder with ingredients I have",
              "A habit tracker with streaks",
              "A URL shortener with analytics",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => { setIdea(suggestion); textareaRef.current?.focus(); }}
                className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-150"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Past Projects */}
        <div onClick={() => setConfirmDeleteId(null)}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white tracking-tight">Your Projects</h2>
            {projects.length > 0 && (
              <span className="text-xs text-slate-500">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[140px] rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-white/[0.08]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">Your first project is waiting to be born.</p>
              <p className="text-slate-600 text-xs mt-1">Share an idea above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const st = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.ONBOARDING;
                const lv = project.level ? LEVEL_BADGE[project.level] : null;
                const isDeleting = deletingId === project.id;
                const isConfirming = confirmDeleteId === project.id;
                return (
                  <div key={project.id} className="relative group">
                    <Link
                      href={`/dashboard/project/${project.id}`}
                      onClick={() => setConfirmDeleteId(null)}
                      className={`block p-5 rounded-2xl border transition-all duration-200 flex flex-col gap-3 ${
                        isDeleting
                          ? "opacity-40 pointer-events-none bg-white/[0.02] border-white/[0.07]"
                          : "bg-white/[0.02] border-white/[0.07] hover:border-blue-500/30 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                        </div>
                        {lv && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${lv.bg} ${lv.text}`}>
                            {lv.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-200 font-medium leading-snug line-clamp-2 flex-1">
                        {project.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">
                          {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <svg
                          className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>

                    {/* Delete button — appears on hover */}
                    {!isDeleting && (
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                          isConfirming
                            ? "bg-red-500/20 border border-red-500/40 text-red-400 opacity-100"
                            : "bg-[#07080f]/80 border border-white/[0.07] text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.08] opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {isConfirming ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Confirm
                          </>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
