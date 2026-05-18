"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    label: "Principle 01",
    title: "You write every line.",
    body: "Mentivo never writes code for you. It explains, questions, and nudges — but the cursor is yours. That's how understanding actually forms.",
  },
  {
    label: "Principle 02",
    title: "Your idea, not a template.",
    body: "You describe what you want to build. Mentivo shapes a roadmap around your idea, not a curriculum recycled across thousands of users.",
  },
  {
    label: "Principle 03",
    title: "No progress without comprehension.",
    body: "Every milestone ends in a tailored check on the code you just wrote. If a concept didn't land, you don't move on yet.",
  },
];

export default function PrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".pr-eyebrow", {
        opacity: 0,
        y: 10,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".pr-eyebrow", start: "top 90%", once: true },
      });

      gsap.from(".pr-headline", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".pr-headline", start: "top 90%", once: true },
      });

      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, y: 24 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          delay: i * 0.08,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="pr-eyebrow eyebrow mb-6">Why Mentivo exists</div>
          <h2
            className="pr-headline text-stone-50 font-semibold"
            style={{
              fontSize: "clamp(30px, 3.6vw, 44px)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
            }}
          >
            Tutorials show. Codegen replaces.{" "}
            <span className="text-stone-500">
              Mentivo teaches.
            </span>
          </h2>
        </div>

        {/* Principles list */}
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] border-y border-[var(--border)]">
          {PRINCIPLES.map((p, i) => (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="px-0 md:px-8 py-10 first:pl-0 last:pr-0 md:first:pl-8 group"
            >
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-stone-500 mb-5">
                <span className="text-amber-400 mr-2">·</span>
                {p.label}
              </p>
              <h3 className="text-stone-50 text-[22px] font-semibold leading-snug tracking-[-0.02em] mb-3">
                {p.title}
              </h3>
              <p className="text-stone-400 text-[14.5px] leading-[1.7]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
