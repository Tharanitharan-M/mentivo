"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Mark = "yes" | "no" | "partial";

type Row = {
  label: string;
  tutorials: Mark;
  codegen: Mark;
  mentivo: Mark;
  tutorialsNote?: string;
  codegenNote?: string;
  mentivoNote?: string;
};

const ROWS: Row[] = [
  {
    label: "You write every line yourself",
    tutorials: "partial",
    tutorialsNote: "Often you copy-paste",
    codegen: "no",
    codegenNote: "It writes for you",
    mentivo: "yes",
  },
  {
    label: "Built around your specific idea",
    tutorials: "no",
    codegen: "yes",
    mentivo: "yes",
  },
  {
    label: "Explains the why, not just the what",
    tutorials: "partial",
    codegen: "no",
    mentivo: "yes",
  },
  {
    label: "Checks you actually understood",
    tutorials: "no",
    codegen: "no",
    mentivo: "yes",
  },
  {
    label: "Runs in the browser, no install",
    tutorials: "partial",
    codegen: "yes",
    mentivo: "yes",
  },
  {
    label: "You can explain what you shipped",
    tutorials: "no",
    codegen: "no",
    mentivo: "yes",
  },
];

function MarkIcon({ mark }: { mark: Mark }) {
  if (mark === "yes") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/45">
        <svg
          className="w-3 h-3 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
    );
  }
  if (mark === "no") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[var(--border)]">
        <svg
          className="w-2.5 h-2.5 text-stone-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.6}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[var(--border)]">
      <span className="w-2 h-[1.5px] bg-stone-500" />
    </span>
  );
}

export default function ComparisonSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cmp-header > *", {
        opacity: 0,
        y: 16,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: ".cmp-header", start: "top 88%", once: true },
      });

      gsap.from(".cmp-row", {
        opacity: 0,
        y: 14,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.05,
        scrollTrigger: { trigger: ".cmp-table", start: "top 85%", once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="compare"
      className="relative py-28 px-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="cmp-header max-w-2xl mb-14">
          <div className="eyebrow mb-6">Honest comparison</div>
          <h2
            className="text-stone-50 font-semibold tracking-[-0.03em] mb-5"
            style={{ fontSize: "clamp(30px, 3.6vw, 44px)", lineHeight: 1.08 }}
          >
            Not another tutorial.{" "}
            <span className="text-stone-500">
              Not a code generator either.
            </span>
          </h2>
          <p className="text-stone-400 text-[16px] leading-[1.7]">
            We&apos;d rather show you what Mentivo is{" "}
            <span className="text-stone-200">and isn&apos;t</span> than invent
            five-star reviews. Here&apos;s the honest read.
          </p>
        </div>

        {/* Comparison table */}
        <div className="cmp-table">
          {/* Header row */}
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 mb-3">
            <div />
            <div className="surface-card px-4 py-3.5 text-center">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-stone-500 mb-1">
                Option 1
              </p>
              <p className="text-stone-200 text-[14px] font-semibold">
                Tutorials
              </p>
            </div>
            <div className="surface-card px-4 py-3.5 text-center">
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-stone-500 mb-1">
                Option 2
              </p>
              <p className="text-stone-200 text-[14px] font-semibold">
                AI codegen
              </p>
            </div>
            <div
              className="rounded-2xl px-4 py-3.5 text-center"
              style={{
                background:
                  "linear-gradient(180deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.04) 100%)",
                border: "1px solid rgba(245,158,11,0.35)",
              }}
            >
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-amber-400 mb-1">
                Mentivo
              </p>
              <p className="text-stone-50 text-[14px] font-semibold">
                A mentor
              </p>
            </div>
          </div>

          {/* Body rows */}
          <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
            {ROWS.map((row, i) => (
              <div
                key={i}
                className={`cmp-row grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 items-center px-4 py-4 ${
                  i !== ROWS.length - 1
                    ? "border-b border-[var(--border)]"
                    : ""
                } hover:bg-[var(--surface)] transition-colors`}
              >
                <p className="text-stone-200 text-[14px] font-medium leading-snug">
                  {row.label}
                </p>
                <div className="flex flex-col items-center gap-1 text-center">
                  <MarkIcon mark={row.tutorials} />
                  {row.tutorialsNote && (
                    <span className="text-[11px] text-stone-600">
                      {row.tutorialsNote}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <MarkIcon mark={row.codegen} />
                  {row.codegenNote && (
                    <span className="text-[11px] text-stone-600">
                      {row.codegenNote}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <MarkIcon mark={row.mentivo} />
                  {row.mentivoNote && (
                    <span className="text-[11px] text-amber-400/80">
                      {row.mentivoNote}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footnote */}
          <p className="text-stone-600 text-[12px] mt-4 leading-relaxed">
            Tutorials and codegen tools can be great — for what they are.
            Mentivo is for the in-between: people who want to{" "}
            <span className="text-stone-400">build something real</span> while
            actually learning to think like a developer.
          </p>
        </div>
      </div>
    </section>
  );
}
