"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { QuizQuestion } from "./page";
import QuizView from "@/components/project/QuizView";
import QuizResults from "@/components/project/QuizResults";

interface Props {
  project: {
    id: string;
    idea: string;
    title: string;
    status: string;
    level: string | null;
  };
  initialMessages: UIMessage[];
  existingQuiz: {
    questions: QuizQuestion[];
    answers: Record<string, string>;
    score: number | null;
    level: string | null;
  } | null;
  userName: string;
  isNew: boolean;
}

type Phase = "chatting" | "quiz" | "complete";

interface QuizResult {
  level: string;
  levelLabel: string;
  summary: string;
  strengths: string[];
  focusAreas: string[];
  encouragement: string;
  nextStep: string;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function MentivoAvatar() {
  return (
    <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
      <Image src="/logo-mark.png" alt="Mentivo" width={16} height={16} className="rounded-sm" />
    </div>
  );
}

function getMessageText(message: UIMessage): string {
  const parts = message.parts ?? [];
  return parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");
}

export default function ProjectClient({
  project,
  initialMessages,
  existingQuiz,
  userName,
  isNew,
}: Props) {
  const [phase, setPhase] = useState<Phase>(() => {
    if (project.status === "ACTIVE" || project.status === "COMPLETED") return "complete";
    if (project.status === "QUIZ") return "quiz";
    return "chatting";
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    existingQuiz?.questions ?? []
  );
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [readyText, setReadyText] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoSent = useRef(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { projectId: project.id },
    }),
    messages: initialMessages,
    onFinish: ({ message }) => {
      const content = getMessageText(message);
      if (content.includes("[READY_FOR_QUIZ]")) {
        const summary = content.replace("[READY_FOR_QUIZ]", "").trim();
        setReadyText(summary);
        triggerQuizGeneration(summary);
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  const triggerQuizGeneration = async (summary: string) => {
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, conversationSummary: summary }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuizQuestions(data.questions);
        setPhase("quiz");
      }
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizComplete = async (answers: Record<string, string>) => {
    const res = await fetch("/api/quiz/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        questions: quizQuestions,
        answers,
      }),
    });
    const data = await res.json();
    setQuizResult(data);
    setPhase("complete");
  };

  // Auto-send the idea as the first message for new projects
  useEffect(() => {
    if (isNew && !hasAutoSent.current && messages.length === 0) {
      hasAutoSent.current = true;
      sendMessage({ text: project.idea });
    }
  }, [isNew, messages.length, project.idea, sendMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading || isGeneratingQuiz) return;
    setInputValue("");
    sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (phase === "quiz") {
    return (
      <QuizView
        projectIdea={project.idea}
        questions={quizQuestions}
        onComplete={handleQuizComplete}
        userName={userName}
        readyText={readyText}
      />
    );
  }

  if (phase === "complete") {
    return (
      <QuizResults
        result={quizResult}
        projectIdea={project.idea}
        existingQuiz={existingQuiz}
        userName={userName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07080f] flex flex-col">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-[0.06]"
        style={{
          background: "radial-gradient(ellipse, #3b82f6 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#07080f]/90 backdrop-blur-2xl sticky top-0 z-40 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="w-px h-4 bg-white/[0.08]" />
            <Link href="/" className="flex items-center gap-1.5">
              <Image src="/logo-mark.png" alt="Mentivo" width={22} height={22} className="rounded-md" />
              <span className="font-semibold text-sm text-white tracking-[-0.02em]">Mentivo</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Understanding your project</span>
          </div>
        </div>
      </header>

      {/* Project idea context bar */}
      <div className="border-b border-white/[0.04] bg-white/[0.01] flex-shrink-0">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-2.5">
          <div className="flex items-start gap-2">
            <svg
              className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-1">
              <span className="text-slate-400 font-medium">Idea: </span>
              {project.idea}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6 space-y-5">
          {messages.map((message) => {
            const isUser = message.role === "user";
            const content = getMessageText(message);
            const displayContent = content.replace("[READY_FOR_QUIZ]", "").trim();
            if (!displayContent) return null;

            return (
              <div key={message.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                {!isUser && <MentivoAvatar />}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-blue-600/20 border border-blue-500/20 text-slate-200 rounded-tr-sm"
                      : "bg-white/[0.04] border border-white/[0.07] text-slate-200 rounded-tl-sm"
                  }`}
                >
                  {displayContent}
                </div>
              </div>
            );
          })}

          {(isLoading || isGeneratingQuiz) && (
            <div className="flex gap-3">
              <MentivoAvatar />
              <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl rounded-tl-sm">
                {isGeneratingQuiz ? (
                  <div className="px-4 py-3 flex items-center gap-2.5 text-sm text-slate-400">
                    <svg
                      className="w-3.5 h-3.5 animate-spin text-blue-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                    Crafting your skill assessment...
                  </div>
                ) : (
                  <TypingDots />
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] bg-[#07080f]/95 backdrop-blur-xl flex-shrink-0">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4">
          <div className="relative flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] focus-within:border-blue-500/30 transition-colors px-4 py-3">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply to Mentivo..."
              disabled={isLoading || isGeneratingQuiz}
              className="flex-1 bg-transparent text-white placeholder:text-slate-600 text-sm outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading || isGeneratingQuiz}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-700 mt-2">
            Mentivo will ask a few questions to understand your project before your skill assessment
          </p>
        </div>
      </div>
    </div>
  );
}
