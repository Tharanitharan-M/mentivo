"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.set(card, { opacity: 0, y: 28 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 88%", once: true },
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="get-started"
      className="relative pt-20 pb-32 px-6"
    >
      <div ref={cardRef} className="max-w-4xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "#0f0d0c",
            border: "1px solid var(--border)",
          }}
        >
          {/* Single warm hairline up top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(245,158,11,0.45), transparent)",
            }}
          />

          {/* Soft warm fade behind the headline */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-44 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)",
            }}
          />

          <div className="relative px-8 py-16 sm:px-16 text-center">
            <p className="eyebrow eyebrow-center mx-auto w-fit mb-8">
              Free to start · No card required
            </p>

            <h2
              className="text-stone-50 font-semibold tracking-[-0.035em] mb-5"
              style={{
                fontSize: "clamp(34px, 5vw, 56px)",
                lineHeight: 1.04,
              }}
            >
              Stop watching.
              <br />
              <span className="text-amber-400">Start building.</span>
            </h2>

            <p className="text-stone-400 text-[16.5px] max-w-xl mx-auto leading-[1.7] mb-10">
              Describe your first project idea and start building it with a
              mentor that makes sure you understand every line.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link
                href="/signup"
                className="btn-primary btn-shimmer w-full sm:w-auto justify-center"
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
              <Link
                href="#how-it-works"
                className="btn-secondary w-full sm:w-auto justify-center"
              >
                See how it works
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-stone-500 text-[13px]">
              {[
                "No local setup",
                "Write code in your browser",
                "Your real project, not a template",
              ].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-stone-600" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
