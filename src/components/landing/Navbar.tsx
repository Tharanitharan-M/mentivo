"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.05 }
    );

    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07080f]/90 backdrop-blur-2xl border-b border-white/[0.07] shadow-xl shadow-black/40"
          : "bg-gradient-to-b from-[#07080f]/70 to-transparent backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo-mark.png"
            alt="Mentivo logo"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="font-bold text-[15px] text-white tracking-[-0.02em]">
            Mentivo
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="px-3.5 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/signin"
            className="px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="btn-shimmer flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 text-white text-[13px] font-semibold hover:bg-blue-400 transition-all shadow-md shadow-blue-500/20"
          >
            Start for free
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#07080f]/95 backdrop-blur-2xl px-5 py-4 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
            <Link
              href="/signin"
              className="px-3 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-semibold text-center"
            >
              Start for free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
