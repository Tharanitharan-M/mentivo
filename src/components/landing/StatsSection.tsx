"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 2400, suffix: "+", prefix: "", label: "Active learners",    sub: "building projects right now",     color: "blue"   },
  { value: 850,  suffix: "+", prefix: "", label: "Projects shipped",   sub: "real apps built and deployed",    color: "orange" },
  { value: 94,   suffix: "%", prefix: "", label: "Completion rate",    sub: "vs. 13% for online courses",      color: "green"  },
  { value: 0,    suffix: "",  prefix: "Free", label: "to start",       sub: "no credit card required",         color: "violet" },
];

const COLORS: Record<string, { val: string; border: string; bg: string }> = {
  blue:   { val: "text-blue-400",   border: "border-blue-500/20",   bg: "bg-blue-500/5"   },
  orange: { val: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/5" },
  green:  { val: "text-green-400",  border: "border-green-500/20",  bg: "bg-green-500/5"  },
  violet: { val: "text-violet-400", border: "border-violet-500/20", bg: "bg-violet-500/5" },
};

export default function StatsSection() {
  const cardRefs   = useRef<(HTMLDivElement   | null)[]>([]);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRef   = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    // ── Label ──
    if (labelRef.current) {
      gsap.set(labelRef.current, { opacity: 0, y: 12 });
      gsap.to(labelRef.current, {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: labelRef.current, start: "top bottom", once: true },
      });
    }

    // ── Cards – each watches itself ──
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { opacity: 0, y: 32 });
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: i * 0.07,
        scrollTrigger: { trigger: el, start: "top bottom", once: true },
      });
    });

    // ── Counters ──
    STATS.forEach((stat, i) => {
      if (!stat.value || !counterRefs.current[i]) return;
      const el  = counterRefs.current[i]!;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: stat.value,
        duration: 2.2,
        ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString(); },
        scrollTrigger: {
          trigger: cardRefs.current[i],
          start: "top bottom",
          once: true,
        },
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section className="relative py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <p
          ref={labelRef}
          className="text-center text-[11px] font-semibold text-slate-600 tracking-widest uppercase mb-8"
        >
          Built by developers who got tired of tutorials that don&apos;t stick
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => {
            const c = COLORS[stat.color];
            return (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`${c.bg} border ${c.border} rounded-2xl px-6 py-5 text-center hover:-translate-y-1 transition-transform duration-300`}
              >
                <div className={`text-4xl font-black mb-1 leading-none ${c.val}`}>
                  {stat.prefix ? (
                    stat.prefix
                  ) : (
                    <>
                      <span ref={(el) => { counterRefs.current[i] = el; }}>0</span>
                      {stat.suffix}
                    </>
                  )}
                </div>
                <p className="text-white text-sm font-semibold mb-0.5">{stat.label}</p>
                <p className="text-slate-500 text-xs">{stat.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
