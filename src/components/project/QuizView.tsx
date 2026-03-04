"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { QuizQuestion } from "@/app/dashboard/project/[id]/page";

interface Props {
  projectIdea: string;
  questions: QuizQuestion[];
  onComplete: (answers: Record<string, string>) => Promise<void>;
  userName: string;
  readyText?: string;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

const DIFFICULTY_STYLE = {
  beginner: "text-sky-400 border-sky-400/20 bg-sky-400/[0.06]",
  intermediate: "text-orange-400 border-orange-400/20 bg-orange-400/[0.06]",
  advanced: "text-purple-400 border-purple-400/20 bg-purple-400/[0.06]",
};

export default function QuizView({ projectIdea, questions, onComplete, userName, readyText }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animating, setAnimating] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = (currentIndex / totalQuestions) * 100;
  const isLast = currentIndex === totalQuestions - 1;

  const handleSelect = (optionId: string) => {
    if (showFeedback || animating) return;
    setSelectedOption(optionId);
    setShowFeedback(true);

    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (isLast) {
        handleFinish(newAnswers);
      } else {
        setAnimating(true);
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setSelectedOption(null);
          setShowFeedback(false);
          setAnimating(false);
        }, 300);
      }
    }, 1000);
  };

  const handleFinish = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    await onComplete(finalAnswers);
  };

  const isCorrect = selectedOption === currentQuestion?.correctId;

  return (
    <div className="min-h-screen bg-[#07080f] flex flex-col">
      {/* Ambient */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse, #a78bfa 0%, transparent 65%)", filter: "blur(80px)" }}
      />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#07080f]/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 h-[56px] flex items-center justify-between">
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
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Skill Assessment</span>
            <span className="text-xs font-semibold text-white bg-white/[0.08] border border-white/[0.1] px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-[3px] bg-white/[0.05]">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progress + (1 / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Intro text (shown on first question) */}
          {currentIndex === 0 && (
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/[0.07] mb-4">
                <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-purple-400">Skill Assessment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                Let&apos;s see where you&apos;re at, {userName.split(" ")[0]}!
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                {readyText || `A few quick questions to understand your level so we can build the perfect learning path for your project.`}
              </p>
            </div>
          )}

          {/* Question card */}
          <div
            className={`rounded-2xl border transition-all duration-300 ${
              animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            } ${
              showFeedback
                ? isCorrect
                  ? "border-green-500/30 bg-green-500/[0.03]"
                  : "border-red-500/20 bg-red-500/[0.02]"
                : "border-white/[0.08] bg-white/[0.02]"
            }`}
          >
            {/* Question header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Question {currentIndex + 1}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLE[currentQuestion.difficulty]}`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <span className="text-xs text-slate-600 font-medium">{currentQuestion.topic}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="px-4 pb-6 grid grid-cols-1 gap-2.5">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedOption === option.id;
                const isThisCorrect = option.id === currentQuestion.correctId;
                const showCorrect = showFeedback && isThisCorrect;
                const showWrong = showFeedback && isSelected && !isThisCorrect;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    disabled={showFeedback || animating}
                    className={`
                      w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-200
                      ${!showFeedback && !isSelected
                        ? "border-white/[0.07] bg-white/[0.02] hover:border-blue-500/30 hover:bg-blue-500/[0.05] hover:text-white text-slate-300 cursor-pointer active:scale-[0.99]"
                        : ""}
                      ${isSelected && !showFeedback ? "border-blue-500/40 bg-blue-500/[0.08] text-white" : ""}
                      ${showCorrect ? "border-green-500/40 bg-green-500/[0.08] text-green-300" : ""}
                      ${showWrong ? "border-red-500/30 bg-red-500/[0.06] text-red-300" : ""}
                      ${showFeedback && !isSelected && !isThisCorrect ? "border-white/[0.04] bg-white/[0.01] text-slate-600 opacity-50" : ""}
                    `}
                  >
                    <span
                      className={`
                        w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 border transition-colors
                        ${showCorrect ? "bg-green-500/20 border-green-500/30 text-green-400" : ""}
                        ${showWrong ? "bg-red-500/20 border-red-500/30 text-red-400" : ""}
                        ${!showFeedback ? "bg-white/[0.06] border-white/[0.1] text-slate-400" : ""}
                        ${showFeedback && !isSelected && !isThisCorrect ? "bg-white/[0.03] border-white/[0.05] text-slate-600" : ""}
                      `}
                    >
                      {showCorrect ? "✓" : showWrong ? "✗" : OPTION_LABELS[i]}
                    </span>
                    <span className="text-sm font-medium leading-snug">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation (shown after answering) */}
            {showFeedback && (
              <div className={`mx-4 mb-5 px-4 py-3 rounded-xl border text-sm leading-relaxed ${
                isCorrect
                  ? "border-green-500/20 bg-green-500/[0.05] text-green-300/80"
                  : "border-orange-500/20 bg-orange-500/[0.05] text-orange-300/80"
              }`}>
                <span className="font-semibold mr-1">{isCorrect ? "Exactly right!" : "Good to know:"}</span>
                {currentQuestion.explanation}
                {isLast && !isSubmitting && (
                  <span className="block mt-2 text-slate-400 text-xs">Evaluating your results...</span>
                )}
              </div>
            )}
          </div>

          {/* Bottom progress dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < currentIndex
                    ? "w-2 h-2 bg-blue-500"
                    : i === currentIndex
                    ? "w-4 h-2 bg-blue-400"
                    : "w-2 h-2 bg-white/[0.1]"
                }`}
              />
            ))}
          </div>

          {isSubmitting && (
            <div className="text-center mt-6 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <svg className="w-4 h-4 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Analyzing your results...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
