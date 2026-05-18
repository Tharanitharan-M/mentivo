"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";

/* ─── Product screenshot showcase ──────────────────────── */
function ProductMockup() {
  return (
    <div className="relative w-full select-none">
      {/* Soft warm ambient — single, very low */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-80px",
          background:
            "radial-gradient(ellipse 65% 50% at 55% 45%, rgba(245,158,11,0.07) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Main window: Roadmap screenshot */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(250,250,249,0.1)",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(250,250,249,0.03), inset 0 1px 0 rgba(250,250,249,0.05)",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(250,250,249,0.07)]"
          style={{ background: "rgba(19,17,16,0.98)" }}
        >
          <div className="flex gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div
            className="flex items-center gap-2 flex-1 max-w-sm mx-4 rounded-lg px-3 py-1.5"
            style={{
              background: "rgba(250,250,249,0.035)",
              border: "1px solid rgba(250,250,249,0.06)",
            }}
          >
            <svg
              className="w-3 h-3 text-stone-600 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-[11px] text-stone-500 truncate">
              mentivo.app/dashboard/project/roadmap
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 ml-auto shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] text-stone-500">Your roadmap</span>
          </div>
        </div>

        {/* Roadmap screenshot */}
        <div className="relative overflow-hidden" style={{ maxHeight: 520 }}>
          <Image
            src="/screenshots/roadmap.png"
            alt="Mentivo personalized learning roadmap"
            width={600}
            height={1800}
            className="w-full"
            style={{ objectFit: "cover", objectPosition: "top" }}
            priority
          />
          <div
            className="absolute bottom-0 inset-x-0 h-28 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, #0b0a09 0%, rgba(11,10,9,0.85) 40%, transparent 100%)",
            }}
          />
        </div>
      </div>

      {/* Floating card: Dashboard idea input */}
      <div
        className="absolute -bottom-6 -left-8 w-72 rounded-2xl overflow-hidden hidden sm:block"
        style={{
          background: "rgba(19,17,16,0.97)",
          border: "1px solid rgba(250,250,249,0.1)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(250,250,249,0.03)",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[rgba(250,250,249,0.06)]">
          <div className="w-5 h-5 rounded-md bg-amber-500/90 flex items-center justify-center shrink-0">
            <svg
              className="w-2.5 h-2.5 text-stone-950"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.4}
                d="M8 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5V11H6V9.5A4 4 0 018 2zm-1 9h2"
              />
            </svg>
          </div>
          <span className="text-[12px] font-semibold text-stone-50">
            New project
          </span>
          <span className="ml-auto text-[10px] text-stone-500">
            Step 1 of 3
          </span>
        </div>
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
              background:
                "linear-gradient(to top, rgba(19,17,16,0.95), transparent)",
            }}
          />
        </div>
      </div>

      {/* Floating card: Learning session */}
      <div
        className="absolute -top-5 -right-8 w-60 rounded-2xl overflow-hidden hidden xl:block"
        style={{
          background: "rgba(19,17,16,0.97)",
          border: "1px solid rgba(250,250,249,0.09)",
          boxShadow:
            "0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(250,250,249,0.03)",
          transform: "rotate(1.5deg)",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgba(250,250,249,0.06)]">
          <span className="text-[10px] text-stone-500 truncate">
            Milestone 2 · Displaying Expenses
          </span>
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
              background:
                "linear-gradient(to top, rgba(19,17,16,0.95), transparent)",
            }}
          />
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
      gsap.from(".hero-eyebrow", {
        opacity: 0,
        y: -8,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.3,
      });

      gsap.from(".hero-line", {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.45,
      });

      gsap.from(".hero-sub", {
        opacity: 0,
        y: 14,
        duration: 0.7,
        ease: "power3.out",
        delay: 0.85,
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 10,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
        delay: 1.0,
      });

      gsap.from(".hero-meta", {
        opacity: 0,
        y: 8,
        duration: 0.5,
        ease: "power2.out",
        delay: 1.25,
      });

      gsap.from(".hero-mockup", {
        opacity: 0,
        y: 36,
        duration: 1,
        ease: "power3.out",
        delay: 0.6,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Calm warm radial behind mockup */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.045) 0%, transparent 70%)",
        }}
      />
      {/* Subtle dot grid */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      {/* Vignette edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 45%, #0b0a09 100%)",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 xl:px-12 pt-28 pb-20">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-14 xl:gap-20 items-center">
          {/* ── Left: copy ── */}
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div className="hero-eyebrow eyebrow mb-7">
              An AI coding mentor
            </div>

            {/* Headline */}
            <h1
              className="font-semibold mb-6"
              style={{
                fontSize: "clamp(44px, 5.6vw, 72px)",
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
              }}
            >
              <span className="hero-line block overflow-hidden">
                <span className="block text-stone-50">An AI that</span>
              </span>
              <span className="hero-line block overflow-hidden">
                <span className="block text-amber-400">teaches you</span>
              </span>
              <span className="hero-line block overflow-hidden">
                <span className="block text-stone-50">to code.</span>
              </span>
            </h1>

            {/* Sub */}
            <p className="hero-sub text-[16.5px] text-stone-400 leading-[1.65] mb-9 max-w-[520px]">
              Mentivo walks you through building a{" "}
              <span className="text-stone-200">real project</span> from scratch.
              You write every line yourself, and by the end you actually
              understand what you built — and why it works.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/signup"
                className="hero-cta btn-primary btn-shimmer"
              >
                Start building free
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.4}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link href="#how-it-works" className="hero-cta btn-secondary">
                See how it works
              </Link>
            </div>

            {/* Honest meta — replaces the fake "2,400+ developers" social proof */}
            <div className="hero-meta flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-stone-500">
              {[
                "No install",
                "No copy-paste",
                "One project at a time",
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-stone-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Product mockup ── */}
          <div className="hero-mockup w-full">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
