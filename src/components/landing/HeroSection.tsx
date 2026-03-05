"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";

/* ─── Product screenshot showcase ──────────────────────── */
function ProductMockup() {
  return (
    <div className="relative w-full select-none">

      {/* ── Outer ambient glow ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-60px",
          background:
            "radial-gradient(ellipse 70% 55% at 55% 45%, rgba(59,130,246,0.14) 0%, rgba(168,85,247,0.07) 45%, transparent 75%)",
          filter: "blur(8px)",
        }}
      />

      {/* ── Main window: Roadmap screenshot ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 48px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]"
          style={{ background: "rgba(8,10,20,0.98)" }}
        >
          <div className="flex gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div
            className="flex items-center gap-2 flex-1 max-w-sm mx-4 rounded-lg px-3 py-1.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <svg className="w-3 h-3 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[11px] text-slate-500 truncate">mentivo.app/dashboard/project/roadmap</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] text-slate-500 hidden sm:inline">Your personalized roadmap</span>
          </div>
        </div>

        {/* Roadmap screenshot — clipped to the most impressive top section */}
        <div className="relative overflow-hidden" style={{ maxHeight: 500 }}>
          <Image
            src="/screenshots/roadmap.png"
            alt="Mentivo personalized learning roadmap"
            width={600}
            height={1800}
            className="w-full"
            style={{ objectFit: "cover", objectPosition: "top" }}
            priority
          />
          {/* Bottom fade so it melts into the dark background */}
          <div
            className="absolute bottom-0 inset-x-0 h-28 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, #07080f 0%, rgba(7,8,15,0.85) 40%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* ── Floating card: Dashboard idea input ── */}
      <div
        className="absolute -bottom-5 -left-6 w-72 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(8,10,20,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Mini header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
          <div className="w-5 h-5 rounded-md bg-blue-600/80 flex items-center justify-center shrink-0">
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5V11H6V9.5A4 4 0 018 2zm-1 9h2" />
            </svg>
          </div>
          <span className="text-[12px] font-semibold text-white">Mentivo</span>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium">Ready to build</span>
          </div>
        </div>
        {/* Dashboard screenshot */}
        <div className="relative overflow-hidden" style={{ maxHeight: 140 }}>
          <Image
            src="/screenshots/dashboard.png"
            alt="Mentivo dashboard"
            width={1024}
            height={845}
            className="w-full"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-10 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(8,10,20,0.95), transparent)",
            }}
          />
        </div>
      </div>

      {/* ── Floating card: Learning session ── */}
      <div
        className="absolute -top-4 -right-6 w-60 rounded-2xl overflow-hidden hidden xl:block"
        style={{
          background: "rgba(8,10,20,0.97)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 20px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
          transform: "rotate(1.5deg)",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[10px] text-slate-500 ml-1 truncate">Milestone 2 · Displaying Expenses</span>
        </div>
        <div className="relative overflow-hidden" style={{ maxHeight: 130 }}>
          <Image
            src="/screenshots/learning page.png"
            alt="Mentivo learning session"
            width={1024}
            height={516}
            className="w-full"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-10 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(8,10,20,0.95), transparent)",
            }}
          />
        </div>
        {/* "In progress" badge */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-full px-2.5 py-1"
            style={{
              color: "#fb923c",
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.25)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            In Progress
          </span>
          <span className="text-[10px] text-slate-500 ml-auto">0 / 3 tasks</span>
        </div>
      </div>

      {/* ── Floating stat chip: roadmap created ── */}
      <div
        className="absolute right-4 -bottom-8 rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background: "rgba(8,10,20,0.97)",
          border: "1px solid rgba(34,197,94,0.25)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(34,197,94,0.06)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-bold text-white leading-none mb-0.5">Roadmap created</p>
          <p className="text-[11px] text-slate-500">7 milestones · Beginner level</p>
        </div>
      </div>

    </div>
  );
}

/* ─── Hero Section ──────────────────────────────────────── */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-tag", {
        opacity: 0,
        y: -14,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.35,
      });

      gsap.from(".hero-line", {
        opacity: 0,
        y: 64,
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
        delay: 0.5,
      });

      gsap.from(".hero-sub", {
        opacity: 0,
        y: 22,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.95,
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.1,
        delay: 1.15,
      });

      gsap.from(".hero-social", {
        opacity: 0,
        y: 12,
        duration: 0.5,
        ease: "power2.out",
        delay: 1.4,
      });

      gsap.from(".hero-ide", {
        opacity: 0,
        y: 48,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.7,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Subtle radial glow behind IDE */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-100 pointer-events-none" />
      {/* Vignette edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, #07080f 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 xl:px-12 pt-24 pb-16">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 xl:gap-20 items-center">
          {/* ── Left: copy ── */}
          <div className="max-w-xl">
            {/* Tag */}
            <div className="hero-tag tag-pill mb-7 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              AI-powered coding mentorship
            </div>

            {/* Headline */}
            <h1 className="text-[56px] xl:text-[68px] font-black leading-[1.02] tracking-[-0.03em] mb-6">
              <span className="hero-line block overflow-hidden">
                <span className="block text-white">An AI that</span>
              </span>
              <span className="hero-line block overflow-hidden">
                <span className="block gradient-text-blue">teaches you</span>
              </span>
              <span className="hero-line block overflow-hidden">
                <span className="block text-white">to code.</span>
              </span>
            </h1>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6 hero-sub">
              <div className="h-px flex-1 bg-gradient-to-r from-orange-500/60 to-transparent" />
              <span className="text-orange-400 text-xs font-bold tracking-widest uppercase shrink-0">
                Not by generating it for you
              </span>
            </div>

            {/* Sub */}
            <p className="hero-sub text-[16px] text-slate-400 leading-[1.7] mb-9">
              Mentivo walks you through building{" "}
              <span className="text-slate-200 font-medium">real projects</span>{" "}
              from scratch. You write every line of code yourself, and by the
              end you actually understand what you built and why it works.{" "}
              <span className="text-slate-200 font-medium">
                No copying. No confusion.
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="#"
                className="hero-cta btn-shimmer inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold text-[15px] hover:bg-blue-400 transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-0.5"
              >
                Start building free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="hero-cta inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 font-semibold text-[15px] hover:bg-white/[0.06] hover:text-white transition-all"
              >
                See how it works
              </Link>
            </div>

            {/* Social proof */}
            <div className="hero-social flex items-center gap-3">
              <div className="flex -space-x-2">
                {["#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ec4899"].map(
                  (c, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-[#07080f] text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ background: c }}
                    >
                      {["A", "K", "R", "S", "T"][i]}
                    </div>
                  )
                )}
              </div>
              <p className="text-sm text-slate-500">
                <span className="text-slate-300 font-semibold">2,400+</span>{" "}
                developers building right now
              </p>
            </div>
          </div>

          {/* ── Right: Product mockup ── */}
          <div className="hero-ide w-full">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
