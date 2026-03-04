"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";

/* ─── Code data ─────────────────────────────────────────── */
type Token = { t: string; c: string };
type Line = Token[];
type FileData = { lines: Line[]; cursorLine: number };

const FILES: Record<string, FileData> = {
  "App.jsx": {
    cursorLine: 8,
    lines: [
      [
        { t: "import", c: "tok-kw" },
        { t: " { ", c: "tok-op" },
        { t: "useState", c: "tok-fn" },
        { t: " } ", c: "tok-op" },
        { t: "from", c: "tok-kw" },
        { t: " ", c: "tok-plain" },
        { t: "'react'", c: "tok-str" },
      ],
      [
        { t: "import", c: "tok-kw" },
        { t: " TodoItem ", c: "tok-var" },
        { t: "from", c: "tok-kw" },
        { t: " ", c: "tok-plain" },
        { t: "'./TodoItem'", c: "tok-str" },
      ],
      [],
      [
        { t: "export default ", c: "tok-kw" },
        { t: "function", c: "tok-kw" },
        { t: " App", c: "tok-fn" },
        { t: "() {", c: "tok-op" },
      ],
      [
        { t: "  ", c: "tok-plain" },
        { t: "const", c: "tok-kw" },
        { t: " [", c: "tok-op" },
        { t: "todos", c: "tok-var" },
        { t: ", ", c: "tok-op" },
        { t: "setTodos", c: "tok-fn" },
        { t: "] = ", c: "tok-op" },
        { t: "useState", c: "tok-fn" },
        { t: "([", c: "tok-op" },
        { t: "])", c: "tok-op" },
      ],
      [
        { t: "  ", c: "tok-plain" },
        { t: "const", c: "tok-kw" },
        { t: " [", c: "tok-op" },
        { t: "input", c: "tok-var" },
        { t: ", ", c: "tok-op" },
        { t: "setInput", c: "tok-fn" },
        { t: "] = ", c: "tok-op" },
        { t: "useState", c: "tok-fn" },
        { t: "('')", c: "tok-str" },
      ],
      [],
      [
        { t: "  ", c: "tok-plain" },
        { t: "const", c: "tok-kw" },
        { t: " addTodo", c: "tok-fn" },
        { t: " = () => {", c: "tok-op" },
      ],
      [
        { t: "    ", c: "tok-plain" },
        { t: "setTodos", c: "tok-fn" },
        { t: "([...", c: "tok-op" },
        { t: "todos", c: "tok-var" },
        { t: ", {", c: "tok-op" },
      ],
      [
        { t: "      ", c: "tok-plain" },
        { t: "id", c: "tok-prop" },
        { t: ": Date.", c: "tok-op" },
        { t: "now", c: "tok-fn" },
        { t: "(),", c: "tok-op" },
      ],
      [
        { t: "      ", c: "tok-plain" },
        { t: "text", c: "tok-prop" },
        { t: ": ", c: "tok-op" },
        { t: "input", c: "tok-var" },
        { t: ", ", c: "tok-op" },
        { t: "done", c: "tok-prop" },
        { t: ": ", c: "tok-op" },
        { t: "false", c: "tok-num" },
      ],
      [{ t: "    }])", c: "tok-op" }],
      [{ t: "  }", c: "tok-op" }],
      [],
      [
        { t: "  ", c: "tok-plain" },
        { t: "return", c: "tok-kw" },
        { t: " (", c: "tok-op" },
      ],
      [
        { t: "    ", c: "tok-plain" },
        { t: "<", c: "tok-jsx" },
        { t: "div", c: "tok-jsx" },
        { t: " className", c: "tok-prop" },
        { t: "=", c: "tok-op" },
        { t: '"app"', c: "tok-str" },
        { t: ">", c: "tok-jsx" },
      ],
      [
        { t: "      {", c: "tok-op" },
        { t: "todos", c: "tok-var" },
        { t: ".", c: "tok-op" },
        { t: "map", c: "tok-fn" },
        { t: "(", c: "tok-op" },
        { t: "todo", c: "tok-var" },
        { t: " => (", c: "tok-op" },
      ],
      [
        { t: "        ", c: "tok-plain" },
        { t: "<", c: "tok-jsx" },
        { t: "TodoItem", c: "tok-jsx" },
        { t: " key", c: "tok-prop" },
        { t: "={", c: "tok-op" },
        { t: "todo", c: "tok-var" },
        { t: ".", c: "tok-op" },
        { t: "id", c: "tok-prop" },
        { t: "} todo", c: "tok-op" },
        { t: "={", c: "tok-op" },
        { t: "todo", c: "tok-var" },
        { t: "} />", c: "tok-jsx" },
      ],
      [{ t: "      )}", c: "tok-op" }],
      [
        { t: "    ", c: "tok-plain" },
        { t: "</", c: "tok-jsx" },
        { t: "div", c: "tok-jsx" },
        { t: ">", c: "tok-jsx" },
      ],
      [{ t: "  )", c: "tok-op" }],
      [{ t: "}", c: "tok-op" }],
    ],
  },
  "TodoItem.jsx": {
    cursorLine: 5,
    lines: [
      [
        { t: "// Renders a single todo with checkbox", c: "tok-cmt" },
      ],
      [
        { t: "export default ", c: "tok-kw" },
        { t: "function", c: "tok-kw" },
        { t: " TodoItem", c: "tok-fn" },
        { t: "({ ", c: "tok-op" },
        { t: "todo", c: "tok-var" },
        { t: ", ", c: "tok-op" },
        { t: "onToggle", c: "tok-var" },
        { t: " }) {", c: "tok-op" },
      ],
      [
        { t: "  ", c: "tok-plain" },
        { t: "return", c: "tok-kw" },
        { t: " (", c: "tok-op" },
      ],
      [
        { t: "    ", c: "tok-plain" },
        { t: "<", c: "tok-jsx" },
        { t: "div", c: "tok-jsx" },
        { t: " className", c: "tok-prop" },
        { t: "=", c: "tok-op" },
        { t: '"todo"', c: "tok-str" },
        { t: ">", c: "tok-jsx" },
      ],
      [
        { t: "      ", c: "tok-plain" },
        { t: "<", c: "tok-jsx" },
        { t: "input", c: "tok-jsx" },
        { t: " type", c: "tok-prop" },
        { t: "=", c: "tok-op" },
        { t: '"checkbox"', c: "tok-str" },
      ],
      [
        { t: "        checked", c: "tok-prop" },
        { t: "={", c: "tok-op" },
        { t: "todo", c: "tok-var" },
        { t: ".", c: "tok-op" },
        { t: "done", c: "tok-prop" },
        { t: "}", c: "tok-op" },
      ],
      [
        { t: "        onChange", c: "tok-prop" },
        { t: "={() => ", c: "tok-op" },
        { t: "onToggle", c: "tok-fn" },
        { t: "(", c: "tok-op" },
        { t: "todo", c: "tok-var" },
        { t: ".", c: "tok-op" },
        { t: "id", c: "tok-prop" },
        { t: ")}", c: "tok-op" },
      ],
      [{ t: "      />", c: "tok-jsx" }],
      [
        { t: "      ", c: "tok-plain" },
        { t: "<", c: "tok-jsx" },
        { t: "span", c: "tok-jsx" },
        { t: ">", c: "tok-jsx" },
        { t: "{", c: "tok-op" },
        { t: "todo", c: "tok-var" },
        { t: ".", c: "tok-op" },
        { t: "text", c: "tok-prop" },
        { t: "}", c: "tok-op" },
        { t: "</", c: "tok-jsx" },
        { t: "span", c: "tok-jsx" },
        { t: ">", c: "tok-jsx" },
      ],
      [
        { t: "    ", c: "tok-plain" },
        { t: "</", c: "tok-jsx" },
        { t: "div", c: "tok-jsx" },
        { t: ">", c: "tok-jsx" },
      ],
      [{ t: "  )", c: "tok-op" }],
      [{ t: "}", c: "tok-op" }],
    ],
  },
  "styles.css": {
    cursorLine: 4,
    lines: [
      [{ t: "/* App styles */", c: "tok-cmt" }],
      [{ t: ".app {", c: "tok-op" }],
      [
        { t: "  ", c: "tok-plain" },
        { t: "max-width", c: "tok-prop" },
        { t: ": ", c: "tok-op" },
        { t: "600px", c: "tok-num" },
        { t: ";", c: "tok-op" },
      ],
      [
        { t: "  ", c: "tok-plain" },
        { t: "margin", c: "tok-prop" },
        { t: ": ", c: "tok-op" },
        { t: "0 auto", c: "tok-str" },
        { t: ";", c: "tok-op" },
      ],
      [
        { t: "  ", c: "tok-plain" },
        { t: "padding", c: "tok-prop" },
        { t: ": ", c: "tok-op" },
        { t: "2rem", c: "tok-num" },
        { t: ";", c: "tok-op" },
      ],
      [{ t: "}", c: "tok-op" }],
      [],
      [{ t: ".todo {", c: "tok-op" }],
      [
        { t: "  ", c: "tok-plain" },
        { t: "display", c: "tok-prop" },
        { t: ": ", c: "tok-op" },
        { t: "flex", c: "tok-str" },
        { t: ";", c: "tok-op" },
      ],
      [
        { t: "  ", c: "tok-plain" },
        { t: "align-items", c: "tok-prop" },
        { t: ": ", c: "tok-op" },
        { t: "center", c: "tok-str" },
        { t: ";", c: "tok-op" },
      ],
      [
        { t: "  ", c: "tok-plain" },
        { t: "gap", c: "tok-prop" },
        { t: ": ", c: "tok-op" },
        { t: "0.5rem", c: "tok-num" },
        { t: ";", c: "tok-op" },
      ],
      [{ t: "}", c: "tok-op" }],
    ],
  },
};

const FILE_ICONS: Record<string, string> = {
  "App.jsx": "⚛",
  "TodoItem.jsx": "⚛",
  "styles.css": "#",
};

const AI_CHAT: Record<string, { role: "ai" | "user"; text: string }[]> = {
  "App.jsx": [
    {
      role: "ai",
      text: "Your useState setup looks perfect! Both todos and input are tracked.",
    },
    {
      role: "user",
      text: "I added the addTodo function, but I'm not sure about the spread syntax.",
    },
    {
      role: "ai",
      text: "Good question. [...todos, newItem] creates a brand new array. React needs a new reference to detect the change. What do you think would happen if you mutated the original array?",
    },
  ],
  "TodoItem.jsx": [
    { role: "ai", text: "Now let's build the component that renders each todo item." },
    { role: "user", text: "Should it receive the whole todo object or just the text?" },
    {
      role: "ai",
      text: "The whole object is better because then it can access the done property for the checkbox too. Think about what props you will need to pass down.",
    },
  ],
  "styles.css": [
    { role: "ai", text: "Looking good! Let's style the todo items now." },
    { role: "user", text: "What's the best way to show a completed todo?" },
    {
      role: "ai",
      text: "Classic approach: `text-decoration: line-through` when `done` is true. How would you conditionally apply that class in React?",
    },
  ],
};

/* ─── IDE Mockup ────────────────────────────────────────── */
function IDEMockup() {
  const [activeFile, setActiveFile] = useState("App.jsx");
  const file = FILES[activeFile];
  const chat = AI_CHAT[activeFile];

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 font-mono text-xs bg-[#0d1117] flex flex-col select-none">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#161b22] border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-1.5 text-slate-500 text-[11px]">
            mentivo-todo / Mentivo IDE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#22c55e]/10 border border-[#22c55e]/25 rounded px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-[10px] font-medium">No errors</span>
          </div>
          <svg
            className="w-3.5 h-3.5 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-end bg-[#0d1117] border-b border-white/[0.06] overflow-x-auto shrink-0">
        {Object.keys(FILES).map((fname) => (
          <button
            key={fname}
            onClick={() => setActiveFile(fname)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] border-r border-white/[0.04] shrink-0 transition-all ${
              activeFile === fname
                ? "bg-[#0d1117] text-slate-200 border-t-2 border-t-blue-400 pt-[9px]"
                : "bg-[#161b22] text-slate-500 hover:text-slate-300 hover:bg-[#1c2128] border-t-2 border-t-transparent"
            }`}
          >
            <span className="text-[10px] opacity-60">{FILE_ICONS[fname]}</span>
            {fname}
            {activeFile === fname && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-0.5 opacity-60" />
            )}
          </button>
        ))}
      </div>

      {/* Main panels */}
      <div className="flex flex-1 min-h-0" style={{ height: "360px" }}>
        {/* File explorer */}
        <div className="w-[130px] shrink-0 bg-[#0d1117] border-r border-white/[0.05] overflow-y-auto">
          <div className="px-2 pt-3 pb-1">
            <p className="text-[9px] font-semibold text-slate-600 tracking-widest uppercase mb-2 px-1">
              Explorer
            </p>
            {/* Root folder */}
            <div className="mb-1">
              <div className="flex items-center gap-1 px-1 py-0.5 text-slate-400 text-[10px]">
                <svg className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg className="w-3 h-3 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <span>src</span>
              </div>
              <div className="ml-3 space-y-0.5">
                {Object.keys(FILES).map((fname) => (
                  <button
                    key={fname}
                    onClick={() => setActiveFile(fname)}
                    className={`w-full flex items-center gap-1.5 px-1 py-0.5 rounded text-[10px] transition-colors ${
                      activeFile === fname
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span className="text-[9px] opacity-50">
                      {FILE_ICONS[fname]}
                    </span>
                    <span className="truncate">{fname}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Public folder */}
            <div>
              <div className="flex items-center gap-1 px-1 py-0.5 text-slate-500 text-[10px]">
                <svg className="w-2.5 h-2.5 shrink-0 opacity-50 -rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <svg className="w-3 h-3 text-slate-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <span>public</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code editor */}
        <div className="flex-1 overflow-auto bg-[#0d1117] min-w-0">
          <div className="p-3 space-y-[2px]">
            {file.lines.map((line, lineIdx) => (
              <div
                key={lineIdx}
                className={`flex items-start gap-3 rounded px-1 ${
                  lineIdx + 1 === file.cursorLine
                    ? "bg-white/[0.025]"
                    : "hover:bg-white/[0.015]"
                }`}
              >
                <span className="text-slate-700 w-5 text-right shrink-0 leading-5 text-[11px]">
                  {lineIdx + 1}
                </span>
                <span className="leading-5 whitespace-pre">
                  {line.length === 0 ? (
                    <>&nbsp;</>
                  ) : (
                    line.map((tok, ti) => (
                      <span key={ti} className={tok.c}>
                        {tok.t}
                      </span>
                    ))
                  )}
                  {lineIdx + 1 === file.cursorLine && (
                    <span className="ide-cursor" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI mentor panel */}
        <div className="w-[210px] shrink-0 bg-[#0c1117] border-l border-white/[0.06] flex flex-col">
          {/* Panel header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06] bg-[#0d1420]">
            <div className="w-5 h-5 rounded-[5px] bg-blue-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-slate-300 text-[11px] font-semibold">
              Mentivo
            </span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[9px]">live</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {chat.map((msg, i) => (
              <div key={i} className={`flex gap-1.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold mt-0.5 ${
                    msg.role === "ai"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {msg.role === "ai" ? "M" : "Y"}
                </div>
                <div
                  className={`text-[10px] leading-[1.5] rounded-lg px-2 py-1.5 max-w-[155px] ${
                    msg.role === "ai"
                      ? "bg-[#161f2e] text-slate-300 rounded-tl-sm border border-white/[0.06]"
                      : "bg-blue-500/15 text-blue-200 rounded-tr-sm border border-blue-500/20"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2 py-1.5">
              <span className="text-slate-600 text-[10px] flex-1">
                Ask Mentivo...
              </span>
              <button className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-blue-600 text-white/75 text-[10px] shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            main
          </span>
          <span>React 18</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{activeFile}</span>
          <span>Ln {file.cursorLine}, Col 1</span>
          <span>UTF-8</span>
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

          {/* ── Right: IDE ── */}
          <div className="hero-ide w-full">
            <IDEMockup />
            {/* Floating hint */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
              </svg>
              <p className="text-slate-600 text-xs">
                Click the tabs to explore the project files
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
