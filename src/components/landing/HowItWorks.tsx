"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

/* ─── Shared screenshot frame ───────────────────────────── */
function ScreenFrame({
  src,
  alt,
  label,
  width,
  height,
  maxH = 260,
}: {
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  maxH?: number;
}) {
  return (
    <div className="w-full">
      <p className="text-[10px] font-mono text-stone-600 mb-2 truncate">
        {label}
      </p>
      <div
        className="rounded-xl overflow-hidden w-full"
        style={{
          border: "1px solid var(--border)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div className="relative overflow-hidden" style={{ maxHeight: maxH }}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-12 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(11,10,9,0.85), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Step data ─────────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    tag: "Describe",
    title: "Describe what you want to build",
    body: "Open Mentivo and describe your idea in plain English. It asks a few focused questions to understand exactly what you want, then tailors everything around your specific project — not a generic template.",
    callout: "Your idea, not a pre-made template.",
    preview: (
      <ScreenFrame
        src="/screenshots/dashboard.png"
        alt="Mentivo dashboard – describe your idea"
        label="mentivo.app/dashboard"
        width={1024}
        height={845}
        maxH={280}
      />
    ),
  },
  {
    num: "02",
    tag: "Plan",
    title: "Get a personalized learning roadmap",
    body: "After a quick 6-question skill check, Mentivo generates a roadmap of 5–8 milestones matched to your current level. Complete beginner? It starts with what HTML even is. Already know the basics? It skips ahead.",
    callout: "A roadmap shaped around you.",
    preview: (
      <ScreenFrame
        src="/screenshots/roadmap.png"
        alt="Mentivo personalized learning roadmap"
        label="mentivo.app/dashboard/project/roadmap"
        width={600}
        height={1800}
        maxH={300}
      />
    ),
  },
  {
    num: "03",
    tag: "Build",
    title: "Build every line yourself, with guidance",
    body: "For each milestone Mentivo explains the concept, then helps you write the code through questions — not by handing you the answer. The built-in editor runs live in the browser. No install, no setup, just build.",
    callout: "It won't move you forward until you genuinely get it.",
    preview: (
      <ScreenFrame
        src="/screenshots/learning page.png"
        alt="Mentivo milestone learning session with code editor"
        label="mentivo.app/dashboard/project/milestone/2"
        width={1024}
        height={516}
        maxH={260}
      />
    ),
  },
  {
    num: "04",
    tag: "Prove",
    title: "Prove you understand before moving on",
    body: "After every milestone Mentivo quizzes you on the exact concepts you just built — questions tailored to your project, not generic trivia. You only advance once you genuinely understand the why behind the code you wrote.",
    callout: "No moving on until it actually clicks.",
    preview: (
      <ScreenFrame
        src="/screenshots/quiz-after-milestone.png"
        alt="Mentivo knowledge-check quiz after a milestone"
        label="mentivo.app/dashboard/project/milestone/quiz"
        width={1024}
        height={600}
        maxH={300}
      />
    ),
  },
  {
    num: "05",
    tag: "Ship",
    title: "Ship a project you can fully explain",
    body: "Once all milestones are done, you have a working, deployed app. Unlike a tutorial you copy-pasted, you understand every decision — because you made every decision. You wrote every line.",
    callout: "One project. Every line yours. Zero confusion.",
    preview: (
      <div className="space-y-3">
        <div className="surface-card flex items-center gap-3 px-4 py-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.32)",
            }}
          >
            <svg
              className="w-5 h-5 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.4}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-stone-50 text-sm font-semibold leading-none mb-1">
              All milestones complete
            </p>
            <p className="text-stone-500 text-[11px] font-mono">
              your-project.mentivo.app
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { val: "7/7", label: "Milestones" },
            { val: "18", label: "Concepts" },
            { val: "340", label: "Lines written" },
          ].map((s, i) => (
            <div
              key={i}
              className="surface-card px-3 py-3 text-center"
            >
              <p className="text-stone-50 text-sm font-semibold">{s.val}</p>
              <p className="text-stone-500 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

/* ─── Component ─────────────────────────────────────────── */
export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Header */
      gsap.from(".hiw-header > *", {
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: ".hiw-header",
          start: "top 88%",
          once: true,
        },
      });

      /* Each step fades in */
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { opacity: 0, y: 24 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          delay: i * 0.05,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      /* Parallax on big background numbers */
      gsap.utils.toArray<HTMLElement>(".step-bg-num").forEach((el) => {
        gsap.to(el, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });

      /* Horizontal scroll on desktop */
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        const track = trackRef.current;
        const stepEls = gsap.utils.toArray<HTMLElement>(".hiw-step");
        if (track && stepEls.length > 1 && sectionRef.current) {
          const total = stepEls.length;
          const trackRect = track.getBoundingClientRect();
          const firstLeft =
            stepEls[0].getBoundingClientRect().left - trackRect.left;
          const lastLeft =
            stepEls[total - 1].getBoundingClientRect().left - trackRect.left;
          const totalDist = lastLeft - firstLeft;

          gsap.to(track, {
            x: -totalDist,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: () => `+=${totalDist}`,
              scrub: 1.1,
              pin: true,
              snap: 1 / (total - 1),
            },
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} id="how-it-works" className="relative py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="hiw-header max-w-2xl mb-20">
          <div className="eyebrow mb-6">The process</div>
          <h2
            className="text-stone-50 font-semibold tracking-[-0.03em] mb-5"
            style={{ fontSize: "clamp(30px, 3.6vw, 44px)", lineHeight: 1.08 }}
          >
            From idea to shipped app in{" "}
            <span className="text-amber-400">five steps</span>.
          </h2>
          <p className="text-stone-400 text-[16px] leading-[1.7]">
            No setup friction, no copy-paste confusion — just a clear path from
            zero to a real, deployed project that you actually understand.
          </p>
        </div>

        {/* Steps */}
        <div className="hiw-steps-container relative">
          <div
            ref={trackRef}
            className="hiw-track flex gap-6 lg:gap-10 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none pb-4"
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="hiw-step relative flex-shrink-0 w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[52vw] snap-center"
              >
                <div className="surface-card overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Left: copy */}
                    <div className="p-8 lg:p-10 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-[var(--border)]">
                      {/* Step badge */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-mono text-[11px] text-amber-400"
                          style={{
                            background: "rgba(245,158,11,0.1)",
                            border: "1px solid rgba(245,158,11,0.28)",
                          }}
                        >
                          {step.num}
                        </div>
                        <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-stone-500">
                          {step.tag}
                        </span>
                      </div>

                      {/* Big background number */}
                      <div className="relative">
                        <span
                          className="step-bg-num absolute -top-2 -left-2 text-[120px] font-semibold leading-none select-none pointer-events-none text-stone-50"
                          style={{
                            opacity: 0.035,
                            letterSpacing: "-0.04em",
                          }}
                        >
                          {step.num}
                        </span>
                        <h3 className="relative text-stone-50 text-[20px] md:text-[22px] font-semibold leading-snug tracking-[-0.02em] mb-3 pt-6">
                          {step.title}
                        </h3>
                        <p className="text-stone-400 text-[14.5px] leading-[1.7]">
                          {step.body}
                        </p>
                      </div>

                      {/* Callout */}
                      <div
                        className="flex items-start gap-2.5 rounded-xl px-4 py-3 mt-auto"
                        style={{
                          background: "rgba(245,158,11,0.06)",
                          border: "1px solid rgba(245,158,11,0.22)",
                        }}
                      >
                        <svg
                          className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400"
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
                        <p className="text-[13px] font-medium leading-relaxed text-amber-300">
                          {step.callout}
                        </p>
                      </div>
                    </div>

                    {/* Right: visual */}
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      {step.preview}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
