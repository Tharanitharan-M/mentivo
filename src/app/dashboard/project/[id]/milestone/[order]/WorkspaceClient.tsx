"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center"><span className="text-slate-600 text-sm">Loading editor…</span></div>,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task { id: string; text: string; hint: string; test?: string }
interface QuizQuestion {
  id: string; question: string;
  options: { id: string; text: string }[];
  correctId: string; explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topic: string;
}
interface QuizResult { passed: boolean; score: number; correct: number; total: number; title: string; body: string }

type Phase = "workspace" | "quiz" | "complete";
type MobileTab = "learn" | "code" | "preview" | "chat";
type DragTarget = "left" | "right" | "vertical" | null;

interface Props {
  project: { id: string; title: string; idea: string; level: string | null };
  milestone: {
    id: string; order: number; title: string; concept: string;
    description: string; estimatedTime: string; difficulty: string;
    tags: string[]; status: string;
    conceptContent: string | null; starterCode: string | null; code: string | null;
    files: Record<string, string> | null;
    tasks: Task[] | null; completedTaskIds: string[];
  };
  totalMilestones: number;
  nextMilestone: { id: string; order: number; title: string } | null;
  prevMilestone: { order: number; title: string } | null;
  chatHistory: UIMessage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVEL_GRADIENT: Record<string, string> = {
  beginner: "from-sky-400 to-blue-500",
  intermediate: "from-orange-400 to-amber-500",
  advanced: "from-purple-400 to-violet-500",
};
const DIFF_COLOR: Record<string, string> = {
  easy:   "text-green-400 bg-green-400/[0.07] border-green-400/20",
  medium: "text-orange-400 bg-orange-400/[0.07] border-orange-400/20",
  hard:   "text-purple-400 bg-purple-400/[0.07] border-purple-400/20",
};
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Project</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 20px; }
  </style>
</head>
<body>
  <h1>Hello World</h1>
  <script>
    // Your code here
  </script>
</body>
</html>`;

function getMessageText(msg: UIMessage) {
  return (msg.parts ?? [])
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");
}

/** Build a single HTML string from multiple files for iframe preview */
function buildPreviewHtml(files: Record<string, string>): string {
  const html = files["index.html"] ?? DEFAULT_HTML;
  const css = files["style.css"] ?? files["styles.css"] ?? "";
  const js = files["script.js"] ?? files["main.js"] ?? "";
  let out = html;
  if (css.trim()) {
    const styleTag = `<style>\n${css.trim()}\n</style>`;
    if (out.includes("</head>")) out = out.replace("</head>", `${styleTag}\n</head>`);
    else if (out.includes("<body>")) out = out.replace("<body>", `<head>${styleTag}</head>\n<body>`);
    else out = styleTag + out;
  }
  if (js.trim()) {
    const scriptTag = `<script>\n${js.trim()}\n</script>`;
    if (out.includes("</body>")) out = out.replace("</body>", `${scriptTag}\n</body>`);
    else out = out + scriptTag;
  }
  return out;
}

function languageForFilename(name: string): string {
  if (name.endsWith(".css")) return "css";
  if (name.endsWith(".js")) return "javascript";
  return "html";
}

/** Build HTML for the test iframe: user's code + script that runs tests and postMessages result (avoids cross-origin access). */
function buildTestSrcdoc(html: string, taskList: Task[]): string {
  const tasksPayload = taskList.filter((t) => t.test?.trim()).map((t) => ({ id: t.id, test: t.test! }));
  if (tasksPayload.length === 0) return html;
  const script = `
<script>
window.__MENTIVO_TASKS__ = ${JSON.stringify(tasksPayload)};
(function(){
  var completedIds = [];
  var arr = window.__MENTIVO_TASKS__ || [];
  for (var i = 0; i < arr.length; i++) {
    var t = arr[i];
    try { if (eval(t.test)) completedIds.push(t.id); } catch(e) {}
  }
  try { window.parent.postMessage({ type: 'MENTIVO_TASK_RESULT', completedIds: completedIds }, '*'); } catch(e) {}
})();
</script>`;
  if (html.includes("</body>")) return html.replace("</body>", script + "\n</body>");
  if (html.includes("</html>")) return html.replace("</html>", script + "\n</html>");
  return html + script;
}

// ─── DragHandle ───────────────────────────────────────────────────────────────
function DragHandle({ direction = "horizontal", extraClass = "", onMouseDown }: {
  direction?: "horizontal" | "vertical";
  extraClass?: string;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`flex-shrink-0 bg-white/[0.07] hover:bg-blue-500/60 active:bg-blue-500 transition-colors z-20 ${
        direction === "horizontal"
          ? "w-1.5 h-full cursor-col-resize"
          : "h-1.5 w-full cursor-row-resize"
      } ${extraClass}`}
    />
  );
}

// ─── TaskItem ─────────────────────────────────────────────────────────────────
function TaskItem({ task, index, isCompleted, isVerifying }: {
  task: Task; index: number; isCompleted: boolean; isVerifying: boolean;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  return (
    <div className={`rounded-xl border p-3 transition-all duration-300 ${
      isCompleted
        ? "border-green-500/25 bg-green-500/[0.05]"
        : "border-white/[0.07] bg-white/[0.02]"
    }`}>
      <div className="flex items-start gap-2.5">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all duration-300 ${
          isCompleted
            ? "bg-green-500 border-green-500"
            : isVerifying
            ? "border-slate-500 animate-pulse"
            : "border-slate-600"
        }`}>
          {isCompleted && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isCompleted ? "text-green-400" : "text-slate-500"}`}>
            Task {index + 1}
          </p>
          <p className={`text-[13px] leading-snug ${isCompleted ? "text-slate-400" : "text-slate-200"}`}>
            {task.text}
          </p>
          {task.hint && (
            <button
              onClick={() => setHintOpen((v) => !v)}
              className="mt-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <svg className={`w-2.5 h-2.5 transition-transform ${hintOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {hintOpen ? "Hide hint" : "Show hint"}
            </button>
          )}
          {hintOpen && (
            <p className="mt-1.5 text-[11px] text-blue-300/70 italic leading-snug bg-blue-500/[0.05] border border-blue-500/20 rounded-lg px-2.5 py-1.5">
              {task.hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main WorkspaceClient ────────────────────────────────────────────────────
export default function WorkspaceClient({
  project, milestone, totalMilestones, nextMilestone, prevMilestone, chatHistory,
}: Props) {
  const router = useRouter();
  const level = project.level ?? "beginner";
  const gradient = LEVEL_GRADIENT[level] ?? LEVEL_GRADIENT.beginner;
  const diffStyle = DIFF_COLOR[milestone.difficulty] ?? DIFF_COLOR.easy;
  const progress = (milestone.order / totalMilestones) * 100;

  // ── Panel sizes (resizable) ────────────────────────────────────────────────
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(320);
  const [previewPct, setPreviewPct] = useState(42); // percent of right panel height
  const [isDragging, setIsDragging] = useState(false);
  const [dragCursor, setDragCursor] = useState<string>("col-resize");
  const dragTarget = useRef<DragTarget>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartVal = useRef(0);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback((target: DragTarget, e: React.MouseEvent) => {
    e.preventDefault();
    dragTarget.current = target;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    dragStartVal.current =
      target === "left" ? leftWidth :
      target === "right" ? rightWidth :
      previewPct;
    setIsDragging(true);
    setDragCursor(target === "vertical" ? "row-resize" : "col-resize");
  }, [leftWidth, rightWidth, previewPct]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const t = dragTarget.current;
      if (!t) return;
      if (t === "left") {
        setLeftWidth(Math.max(220, Math.min(460, dragStartVal.current + e.clientX - dragStartX.current)));
      } else if (t === "right") {
        setRightWidth(Math.max(260, Math.min(500, dragStartVal.current - (e.clientX - dragStartX.current))));
      } else if (t === "vertical" && rightPanelRef.current) {
        const h = rightPanelRef.current.getBoundingClientRect().height;
        const dy = e.clientY - dragStartY.current;
        setPreviewPct(Math.max(20, Math.min(70, dragStartVal.current + (dy / h) * 100)));
      }
    };
    const onUp = () => { dragTarget.current = null; setIsDragging(false); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  // ── Files + preview ───────────────────────────────────────────────────────
  const initialFiles: Record<string, string> = milestone.files ?? {
    "index.html": milestone.code ?? milestone.starterCode ?? DEFAULT_HTML,
  };
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [activeFile, setActiveFile] = useState<string>(() => Object.keys(initialFiles)[0] ?? "index.html");
  const [previewSrc, setPreviewSrc] = useState(() => buildPreviewHtml(initialFiles));
  const [previewKey, setPreviewKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const filesRef = useRef(files);
  filesRef.current = files;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [showAddFile, setShowAddFile] = useState(false);
  const [testSrcdoc, setTestSrcdoc] = useState<string | null>(null);
  const testIframeRef = useRef<HTMLIFrameElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [showLearn, setShowLearn] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("code");
  const [phase, setPhase] = useState<Phase>(milestone.status === "COMPLETED" ? "complete" : "workspace");
  const [conceptContent, setConceptContent] = useState(milestone.conceptContent ?? "");
  const [isConceptLoading, setIsConceptLoading] = useState(!milestone.conceptContent);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // ── Task state ─────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>(milestone.tasks ?? []);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(milestone.completedTaskIds ?? []);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isStarterLoading, setIsStarterLoading] = useState(!milestone.starterCode);
  const lastVerifiedCode = useRef<string>("");

  // Next is only enabled when EVERY task is explicitly checked off
  const allTasksDone = tasks.length > 0 && tasks.every((t) => completedTaskIds.includes(t.id));
  const nextEnabled = allTasksDone || milestone.status === "COMPLETED";

  // ── Load concept ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (milestone.conceptContent) return;
    fetch("/api/milestone/concept", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId: milestone.id, projectId: project.id }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.content) setConceptContent(d.content); })
      .finally(() => setIsConceptLoading(false));
  }, [milestone.conceptContent, milestone.id, project.id]);

  // ── Load starter + tasks ───────────────────────────────────────────────────
  useEffect(() => {
    if (milestone.starterCode && milestone.tasks) { setIsStarterLoading(false); return; }
    fetch("/api/milestone/starter", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId: milestone.id }),
    })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) return null;
        if (!text.trim()) return null;
        try {
          return JSON.parse(text) as { files?: Record<string, string>; code?: string; tasks?: Task[] };
        } catch {
          return null;
        }
      })
      .then((d) => {
        if (!d) return;
        const nextFiles = d.files ?? { "index.html": d.code ?? DEFAULT_HTML };
        if (Object.keys(nextFiles).length > 0) {
          setFiles(nextFiles);
          filesRef.current = nextFiles;
          if (!Object.prototype.hasOwnProperty.call(nextFiles, activeFile)) setActiveFile(Object.keys(nextFiles)[0] ?? "index.html");
          setPreviewSrc(buildPreviewHtml(nextFiles));
          setPreviewKey((k) => k + 1);
        }
        if (d.tasks) setTasks(d.tasks);
      })
      .finally(() => setIsStarterLoading(false));
  }, [milestone.id, milestone.starterCode, milestone.tasks, milestone.code]);

  const testHtmlRef = useRef<string>("");
  const pendingVerifyRef = useRef<{ milestoneId: string } | null>(null);

  const verifyTasks = useCallback((codeToVerify: string) => {
    if (tasks.length === 0 || isVerifying || codeToVerify === lastVerifiedCode.current) return;
    const allHaveTests = tasks.every((t) => t.test?.trim());
    if (allHaveTests) {
      testHtmlRef.current = codeToVerify;
      pendingVerifyRef.current = { milestoneId: milestone.id };
      setTestSrcdoc(buildTestSrcdoc(codeToVerify, tasks));
      setIsVerifying(true);
      return;
    }
    setIsVerifying(true);
    fetch("/api/milestone/verify-tasks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId: milestone.id, code: codeToVerify, tasks }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.completedIds) {
          setCompletedTaskIds(data.completedIds);
          lastVerifiedCode.current = codeToVerify;
        }
      })
      .finally(() => setIsVerifying(false));
  }, [tasks, isVerifying, milestone.id]);

  // Iframe runs injected script and posts result; we handle it here (no cross-origin access)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "MENTIVO_TASK_RESULT" || !Array.isArray(data.completedIds)) return;
      const pending = pendingVerifyRef.current;
      if (!pending) return;
      const completedIds = data.completedIds as string[];
      setCompletedTaskIds(completedIds);
      lastVerifiedCode.current = testHtmlRef.current;
      fetch("/api/milestone/verify-tasks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: pending.milestoneId, completedIds }),
      }).catch(() => {});
      pendingVerifyRef.current = null;
      setTestSrcdoc(null);
      setIsVerifying(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // ── Code change handler ────────────────────────────────────────────────────
  const handleCodeChange = useCallback((value: string | undefined) => {
    const v = value ?? "";
    setFiles((prev) => {
      const next = { ...prev, [activeFile]: v };
      filesRef.current = next;
      return next;
    });
    setSaveStatus("unsaved");

    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      const next = { ...filesRef.current, [activeFile]: v };
      setPreviewSrc(buildPreviewHtml(next));
      setPreviewKey((k) => k + 1);
    }, 1000);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      const toSave = { ...filesRef.current, [activeFile]: v };
      await fetch("/api/milestone/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId: milestone.id, files: toSave }),
      });
      setSaveStatus("saved");
    }, 3000);

    if (verifyTimer.current) clearTimeout(verifyTimer.current);
    verifyTimer.current = setTimeout(() => {
      const full = buildPreviewHtml({ ...filesRef.current, [activeFile]: v });
      verifyTasks(full);
    }, 8000);
  }, [milestone.id, activeFile, verifyTasks]);

  // ── Chat ───────────────────────────────────────────────────────────────────
  const { messages: chatMessages, sendMessage, status: chatStatus } = useChat({
    transport: new DefaultChatTransport({ api: "/api/milestone/chat", body: { milestoneId: milestone.id } }),
    messages: chatHistory,
  });
  const isChatLoading = chatStatus === "submitted" || chatStatus === "streaming";

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, isChatLoading]);

  const handleChatSend = () => {
    const text = chatInput.trim();
    if (!text || isChatLoading) return;
    setChatInput(""); sendMessage({ text });
  };

  // ── Quiz flow ──────────────────────────────────────────────────────────────
  const handleStartQuiz = async () => {
    setIsGeneratingQuiz(true);
    await fetch("/api/milestone/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId: milestone.id, files: filesRef.current }),
    });
    const res = await fetch("/api/milestone/quiz-generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId: milestone.id }),
    });
    const data = await res.json();
    if (data.questions) { setQuizQuestions(data.questions); setPhase("quiz"); }
    setIsGeneratingQuiz(false);
  };

  // ── Next: take quiz first if not completed, then go to next milestone ──────
  const handleNext = () => {
    if (!nextEnabled || !nextMilestone) return;
    if (milestone.status !== "COMPLETED" && allTasksDone) {
      handleStartQuiz();
      return;
    }
    router.push(`/dashboard/project/${project.id}/milestone/${nextMilestone.order}`);
  };

  // ─── Phase: Quiz ───────────────────────────────────────────────────────────
  if (phase === "quiz") {
    return (
      <MilestoneQuiz
        questions={quizQuestions}
        milestone={{ order: milestone.order, title: milestone.title, concept: milestone.concept }}
        gradient={gradient}
        onComplete={async (answers) => {
          const res = await fetch("/api/milestone/quiz-evaluate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ milestoneId: milestone.id, questions: quizQuestions, answers }),
          });
          const result = await res.json();
          setQuizResult(result);
          if (result.passed) setPhase("complete");
          return result;
        }}
        onBack={() => setPhase("workspace")}
        projectId={project.id}
        nextMilestone={nextMilestone}
      />
    );
  }

  // ─── Phase: Complete ───────────────────────────────────────────────────────
  if (phase === "complete") {
    return (
      <MilestoneComplete
        milestone={{ order: milestone.order, title: milestone.title }}
        quizResult={quizResult}
        gradient={gradient}
        projectId={project.id}
        nextMilestone={nextMilestone}
      />
    );
  }

  // ─── Phase: Workspace ──────────────────────────────────────────────────────
  return (
    <div
      className="h-screen bg-[#07080f] flex flex-col overflow-hidden"
      style={{ userSelect: isDragging ? "none" : "auto" }}
    >
      {/* Drag overlay — covers iframe + Monaco so they don't steal mouse events */}
      {isDragging && (
        <div className="fixed inset-0 z-[200]" style={{ cursor: dragCursor }} />
      )}
      {/* Hidden iframe for automated task tests — loads learner code and runs test snippets */}
      {testSrcdoc && (
        <iframe
          ref={testIframeRef}
          srcDoc={testSrcdoc}
          title="Task verification"
          className="fixed opacity-0 pointer-events-none w-0 h-0"
          sandbox="allow-scripts"
        />
      )}
      {/* Reset milestone confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0f1a] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Reset this milestone?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your code and task progress will be reset to the original starter. Your chat history in this milestone will be cleared. You can start coding again from scratch.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsResetting(true);
                  try {
                    const res = await fetch("/api/milestone/reset", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ milestoneId: milestone.id }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      if (data.error) alert(data.error);
                      return;
                    }
                    const newFiles = data.files ?? { "index.html": data.code ?? "" };
                    setFiles(newFiles);
                    filesRef.current = newFiles;
                    setCompletedTaskIds([]);
                    setActiveFile(Object.keys(newFiles)[0] ?? "index.html");
                    setPreviewSrc(buildPreviewHtml(newFiles));
                    setPreviewKey((k) => k + 1);
                    lastVerifiedCode.current = "";
                    setShowResetConfirm(false);
                    setPhase("workspace");
                  } finally {
                    setIsResetting(false);
                  }
                }}
                disabled={isResetting}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {isResetting ? "Resetting…" : "Yes, reset"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="h-12 flex-shrink-0 border-b border-white/[0.07] bg-[#0b0d14] flex items-center px-3 gap-3 z-30">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/dashboard/project/${project.id}/roadmap`} className="text-slate-500 hover:text-white transition-colors p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="w-px h-4 bg-white/[0.08]" />
          <Link href="/">
            <Image src="/logo-mark.png" alt="Mentivo" width={20} height={20} className="rounded-md" />
          </Link>
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex-shrink-0">M{milestone.order}</span>
          <span className="text-xs font-semibold text-white truncate">{milestone.title}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${diffStyle}`}>
            {milestone.difficulty}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-slate-600">{milestone.order}/{totalMilestones}</span>
          <div className="w-20 h-1 rounded-full bg-white/[0.07] overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {saveStatus === "saved"   && <span className="text-[10px] text-slate-600">Saved</span>}
          {saveStatus === "saving"  && <span className="text-[10px] text-slate-500 animate-pulse">Saving…</span>}
          {saveStatus === "unsaved" && <span className="text-[10px] text-orange-500/70">Unsaved</span>}
        </div>

        <button
          onClick={() => setShowLearn((v) => !v)}
          className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[11px] font-medium text-slate-400 hover:text-white transition-colors flex-shrink-0"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {showLearn ? "Hide" : "Learn"}
        </button>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[11px] font-medium text-slate-400 hover:text-orange-400 hover:border-orange-500/20 transition-colors flex-shrink-0"
          title="Reset to starter code"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>

        <button
          onClick={handleStartQuiz}
          disabled={isGeneratingQuiz}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradient} text-white text-[11px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex-shrink-0`}
        >
          {isGeneratingQuiz ? (
            <><svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>Building…</>
          ) : (
            <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Test Knowledge</>
          )}
        </button>
      </header>

      {/* ── Mobile tab bar ─────────────────────────────────────────── */}
      <div className="lg:hidden flex border-b border-white/[0.07] bg-[#0b0d14] flex-shrink-0">
        {(["learn", "code", "preview", "chat"] as MobileTab[]).map((tab) => (
          <button key={tab} onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors ${mobileTab === tab ? "text-white border-b-2 border-blue-400" : "text-slate-600"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Panels ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* LEFT: Learn ─────────────────────────────────────────────── */}
        {(showLearn || mobileTab === "learn") && (
          <div
            className={`flex-shrink-0 border-r border-white/[0.07] bg-[#0b0c13] flex flex-col min-h-0
              ${mobileTab === "learn" ? "flex-1 w-full" : "hidden lg:flex"}
            `}
            style={mobileTab !== "learn" ? { width: leftWidth } : {}}
          >
            {/* Learn label */}
            <div className="px-5 pt-5 pb-0 flex items-center gap-2 flex-shrink-0">
              <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Learn</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Concept content */}
              {isConceptLoading ? (
                <div className="space-y-3 pt-2">
                  <div className="h-7 w-3/4 rounded-lg bg-white/[0.05] animate-pulse" />
                  <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
                  <div className="h-3 w-5/6 rounded bg-white/[0.04] animate-pulse" />
                  <div className="h-3 w-4/6 rounded bg-white/[0.04] animate-pulse" />
                  <div className="h-20 w-full rounded-xl bg-white/[0.03] animate-pulse mt-4" />
                </div>
              ) : (
                <div className="concept-content">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-[22px] font-black text-white tracking-tight leading-tight mb-4 mt-1">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-[15px] font-bold text-white mt-5 mb-2">{children}</h2>
                      ),
                      p: ({ children }) => (
                        <p className="text-[13px] text-slate-300 leading-relaxed mb-4">{children}</p>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-[#0d0f1a] border border-white/[0.08] rounded-xl p-4 overflow-x-auto my-4 text-[12px] font-mono leading-relaxed">
                          {children}
                        </pre>
                      ),
                      code: ({ children, className }) => (
                        className?.includes("language-")
                          ? <code className="block text-[11px] font-mono text-slate-300">{children}</code>
                          : <code className="text-[11px] font-mono text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">{children}</code>
                      ),
                      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    }}
                  >
                    {conceptContent}
                  </ReactMarkdown>
                </div>
              )}

              {/* ── Divider ── */}
              <div className="my-5 border-t border-white/[0.07]" />

              {/* ── Instructions / Tasks ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-black text-white uppercase tracking-widest">Instructions</h2>
                  {tasks.length > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      allTasksDone
                        ? "text-green-400 bg-green-400/[0.07] border-green-400/20"
                        : "text-slate-500 bg-white/[0.04] border-white/[0.08]"
                    }`}>
                      {completedTaskIds.length}/{tasks.length}
                    </span>
                  )}
                </div>

                {isStarterLoading && tasks.length === 0 ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
                    ))}
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-2.5">
                    {tasks.map((task, i) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        index={i}
                        isCompleted={completedTaskIds.includes(task.id)}
                        isVerifying={isVerifying}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-xs">No tasks for this milestone.</p>
                )}

                {/* Check my work button */}
                {tasks.length > 0 && !allTasksDone && (
                  <button
                    onClick={() => verifyTasks(buildPreviewHtml(filesRef.current))}
                    disabled={isVerifying}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] text-slate-400 text-[12px] font-semibold transition-all disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <><svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" /></svg>Checking your code…</>
                    ) : (
                      <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Check my work</>
                    )}
                  </button>
                )}

                {allTasksDone && tasks.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-500/[0.07] border border-green-500/20">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-300 text-[12px] font-semibold">All tasks complete — ready for the next milestone!</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Sticky Prev / Next ── */}
            <div className="flex-shrink-0 border-t border-white/[0.07] p-3 flex items-center justify-between gap-2 bg-[#0b0c13]">
              {prevMilestone ? (
                <Link
                  href={`/dashboard/project/${project.id}/milestone/${prevMilestone.order}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] text-slate-400 text-[12px] font-semibold transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </Link>
              ) : (
                <Link
                  href={`/dashboard/project/${project.id}/roadmap`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] text-slate-400 text-[12px] font-semibold transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Roadmap
                </Link>
              )}

              {/* Next — take quiz first if not completed, then go to next milestone */}
              {nextMilestone ? (
                <button
                  onClick={handleNext}
                  disabled={!nextEnabled}
                  title={
                    !nextEnabled
                      ? "Complete all tasks to continue"
                      : milestone.status === "COMPLETED"
                      ? `Go to ${nextMilestone.title}`
                      : "Take the quiz to complete this milestone"
                  }
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    nextEnabled
                      ? `bg-gradient-to-r ${gradient} text-white hover:opacity-90 active:scale-95`
                      : "border border-white/[0.06] bg-white/[0.02] text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {milestone.status !== "COMPLETED" && allTasksDone ? "Take quiz" : "Next"}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <Link
                  href={`/dashboard/project/${project.id}/roadmap`}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-all`}
                >
                  Finish
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* LEFT drag handle — rendered directly in flex row so align-items:stretch gives it full height */}
        {showLearn && (
          <DragHandle extraClass="hidden lg:flex" onMouseDown={(e) => startDrag("left", e)} />
        )}

        {/* CENTER: File tree + Editor ──────────────────────────────────────────── */}
        <div className={`flex flex-col flex-1 min-w-0 min-h-0 ${mobileTab === "code" ? "flex" : "hidden lg:flex"}`}>
          <div className="h-9 flex-shrink-0 flex items-center border-b border-white/[0.07] bg-[#0d0f1a]">
            {/* File tree */}
            <div className="flex items-center gap-0.5 px-2 min-w-0 flex-1 overflow-x-auto">
              {Object.keys(files).map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveFile(name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md border border-b-0 text-[11px] font-medium transition-colors flex-shrink-0 ${
                    activeFile === name
                      ? "bg-[#1e1e2e] border-white/[0.07] text-slate-200"
                      : "border-transparent text-slate-500 hover:text-slate-400 hover:bg-white/[0.04]"
                  }`}
                >
                  {name.endsWith(".html") && <span className="text-orange-400">◇</span>}
                  {name.endsWith(".css") && <span className="text-blue-400">◆</span>}
                  {name.endsWith(".js") && <span className="text-yellow-400">◇</span>}
                  {name}
                </button>
              ))}
              <div className="relative flex-shrink-0 ml-1">
                {showAddFile ? (
                  <div className="flex items-center gap-1 px-2 py-1">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const name = newFileName.trim() || "script.js";
                          const safe = name.includes(".") ? name : `${name}.js`;
                          if (!Object.prototype.hasOwnProperty.call(files, safe)) {
                            const empty = safe.endsWith(".css") ? "/* styles */" : safe.endsWith(".js") ? "// your code" : "";
                            setFiles((p) => ({ ...p, [safe]: empty }));
                            setActiveFile(safe);
                            setNewFileName("");
                            setShowAddFile(false);
                          }
                        }
                        if (e.key === "Escape") { setShowAddFile(false); setNewFileName(""); }
                      }}
                      placeholder="filename.js"
                      className="w-24 bg-white/[0.06] border border-white/[0.1] rounded px-2 py-0.5 text-[11px] text-white placeholder:text-slate-500 outline-none"
                      autoFocus
                    />
                    <button onClick={() => setShowAddFile(false)} className="text-slate-500 hover:text-white text-[10px]">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowAddFile(true); setNewFileName(""); }}
                    className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
                    title="Add file"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">
            {isStarterLoading && (
              <div className="absolute inset-0 bg-[#1e1e1e] flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <svg className="w-4 h-4 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Generating starter code…
                </div>
              </div>
            )}
            <Editor
              key={activeFile}
              height="100%"
              defaultLanguage={languageForFilename(activeFile)}
              value={files[activeFile] ?? ""}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'Geist Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineNumbers: "on",
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* RIGHT drag handle */}
        <DragHandle extraClass="hidden lg:flex" onMouseDown={(e) => startDrag("right", e)} />

        {/* RIGHT: Preview + Chat ──────────────────────────────────── */}
        <div
          ref={rightPanelRef}
          className={`flex-shrink-0 border-l border-white/[0.07] flex flex-col min-h-0
            ${mobileTab === "preview" || mobileTab === "chat" ? "flex flex-1 w-full" : "hidden lg:flex"}
          `}
          style={{ width: mobileTab === "preview" || mobileTab === "chat" ? undefined : rightWidth }}
        >
          {/* Preview */}
          <div
            className={`flex flex-col min-h-0 border-b border-white/[0.07]
              ${mobileTab === "chat" ? "hidden lg:flex" : "flex"}
            `}
            style={{ height: mobileTab === "preview" ? "100%" : `${previewPct}%` }}
          >
            <div className="h-8 flex-shrink-0 flex items-center justify-between px-3 bg-[#0d0f1a] border-b border-white/[0.07]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                <div className="w-2 h-2 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] text-slate-600 font-medium">Preview</span>
              <button
                onClick={() => { setPreviewSrc(buildPreviewHtml(files)); setPreviewKey((k) => k + 1); }}
                className="text-slate-500 hover:text-white transition-colors"
                title="Refresh preview"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="flex-1 bg-white overflow-hidden">
              <iframe key={previewKey} srcDoc={previewSrc} sandbox="allow-scripts allow-modals" className="w-full h-full border-0" title="Live preview" />
            </div>
          </div>

          {/* Vertical drag handle — only on desktop between preview and chat */}
          {mobileTab !== "chat" && mobileTab !== "preview" && (
            <DragHandle direction="vertical" extraClass="hidden lg:flex" onMouseDown={(e) => startDrag("vertical", e)} />
          )}

          {/* Chat */}
          <div
            className={`flex flex-col min-h-0 ${mobileTab === "preview" ? "hidden lg:flex" : "flex"}`}
            style={{ flex: mobileTab === "chat" ? "1" : "1 1 0" }}
          >
            <div className="h-8 flex-shrink-0 flex items-center gap-2 px-3 bg-[#0d0f1a] border-b border-white/[0.07]">
              <div className="w-4 h-4 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Image src="/logo-mark.png" alt="M" width={10} height={10} className="rounded-sm" />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Mentivo AI</span>
              {isChatLoading && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-auto" />}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {chatMessages.length === 0 && (
                <>
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 mb-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">About this workspace</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Multi-file editor with live preview — no Sandpack or npm. Use the <strong className="text-slate-300">+</strong> next to file tabs to add <code className="text-blue-300">style.css</code>, <code className="text-blue-300">script.js</code>, etc. The AI can suggest code; paste it here or ask it to add content to your sandbox.
                    </p>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Ask me anything about{" "}
                      <span className="text-blue-400 font-medium">{milestone.concept}</span>
                      <br />or paste your code for a review.
                    </p>
                  </div>
                </>
              )}
              {chatMessages.map((msg) => {
                const isUser = msg.role === "user";
                const text = getMessageText(msg);
                if (!text) return null;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    {!isUser && (
                      <div className="w-5 h-5 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Image src="/logo-mark.png" alt="M" width={10} height={10} className="rounded-sm" />
                      </div>
                    )}
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-blue-600/20 border border-blue-500/20 text-slate-200 rounded-tr-sm"
                        : "bg-white/[0.04] border border-white/[0.07] text-slate-300 rounded-tl-sm"
                    }`}>
                      {text}
                    </div>
                  </div>
                );
              })}
              {isChatLoading && (
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <Image src="/logo-mark.png" alt="M" width={10} height={10} className="rounded-sm" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl rounded-tl-sm p-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex-shrink-0 p-2 border-t border-white/[0.07]">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] focus-within:border-blue-500/30 transition-colors px-2.5 py-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                  placeholder="Ask Mentivo…"
                  disabled={isChatLoading}
                  className="flex-1 bg-transparent text-white placeholder:text-slate-600 text-[11px] outline-none"
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="w-6 h-6 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-30 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Milestone Quiz ───────────────────────────────────────────────────────────
const OPTION_LABELS = ["A", "B", "C", "D"];

function MilestoneQuiz({ questions, milestone, gradient, onComplete, onBack, projectId, nextMilestone }: {
  questions: QuizQuestion[];
  milestone: { order: number; title: string; concept: string };
  gradient: string;
  onComplete: (answers: Record<string, string>) => Promise<QuizResult>;
  onBack: () => void;
  projectId: string;
  nextMilestone: { id: string; order: number; title: string } | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (optId: string) => {
    if (showFeedback || animating) return;
    setSelected(optId);
    setShowFeedback(true);
    const newAnswers = { ...answers, [q.id]: optId };
    setAnswers(newAnswers);
    setTimeout(async () => {
      if (isLast) {
        setIsSubmitting(true);
        const r = await onComplete(newAnswers);
        setResult(r);
        setIsSubmitting(false);
      } else {
        setAnimating(true);
        setTimeout(() => { setCurrentIndex((i) => i + 1); setSelected(null); setShowFeedback(false); setAnimating(false); }, 300);
      }
    }, 1000);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[#07080f] flex items-center justify-center p-5">
        <div className="w-full max-w-md space-y-4">
          <div className={`rounded-2xl border p-8 text-center ${result.passed ? "border-green-500/20 bg-green-500/[0.03]" : "border-orange-500/20 bg-orange-500/[0.03]"}`}>
            <div className="text-4xl mb-3">{result.passed ? "🎉" : "💪"}</div>
            <h2 className={`text-2xl font-black mb-2 ${result.passed ? "text-green-400" : "text-orange-400"}`}>{result.title}</h2>
            <p className="text-slate-400 text-sm mb-4">{result.body}</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${result.passed ? "bg-green-500/10 text-green-300" : "bg-orange-500/10 text-orange-300"}`}>
              {result.correct}/{result.total} correct · {result.score}%
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {!result.passed && (
              <button onClick={onBack} className="py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] text-slate-300 text-sm font-medium transition-all">
                Review & Try Again
              </button>
            )}
            {result.passed && nextMilestone && (
              <Link href={`/dashboard/project/${projectId}/milestone/${nextMilestone.order}`}
                className={`flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-semibold`}>
                <span className="flex flex-col items-start">
                  <span className="text-[10px] opacity-70 uppercase tracking-wider">Next Up</span>
                  <span className="truncate max-w-[200px]">{nextMilestone.title}</span>
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
            <Link href={`/dashboard/project/${projectId}/roadmap`}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] text-slate-400 text-sm font-medium transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              Back to Roadmap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = ((currentIndex) / questions.length) * 100 + (1 / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#07080f] flex flex-col">
      <header className="border-b border-white/[0.06] bg-[#07080f]/90 backdrop-blur-2xl h-[56px] flex items-center px-5 justify-between">
        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to workspace
        </button>
        <span className="text-xs font-semibold text-white bg-white/[0.08] border border-white/[0.1] px-2.5 py-1 rounded-full">
          {currentIndex + 1} / {questions.length}
        </span>
      </header>
      <div className="h-[3px] bg-white/[0.05]">
        <div className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`} style={{ width: `${progressPct}%` }} />
      </div>
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-2xl">
          {currentIndex === 0 && (
            <p className="text-center text-slate-400 text-sm mb-8">
              Time to test your understanding of <span className="text-white font-semibold">{milestone.concept}</span>
            </p>
          )}
          <div className={`rounded-2xl border transition-all duration-300 ${animating ? "opacity-0 translate-y-2" : "opacity-100"} ${
            showFeedback ? (selected === q.correctId ? "border-green-500/30 bg-green-500/[0.03]" : "border-red-500/20 bg-red-500/[0.02]") : "border-white/[0.08] bg-white/[0.02]"
          }`}>
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Question {currentIndex + 1}</span>
                <span className="text-xs text-slate-600">{q.topic}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug">{q.question}</h3>
            </div>
            <div className="px-4 pb-6 grid gap-2.5">
              {q.options.map((opt, i) => {
                const isSelected = selected === opt.id;
                const isCorrect = opt.id === q.correctId;
                const showCorrect = showFeedback && isCorrect;
                const showWrong = showFeedback && isSelected && !isCorrect;
                return (
                  <button key={opt.id} onClick={() => handleSelect(opt.id)} disabled={showFeedback || animating}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-200
                      ${!showFeedback ? "border-white/[0.07] bg-white/[0.02] hover:border-blue-500/30 hover:bg-blue-500/[0.05] text-slate-300 cursor-pointer active:scale-[0.99]" : ""}
                      ${showCorrect ? "border-green-500/40 bg-green-500/[0.08] text-green-300" : ""}
                      ${showWrong   ? "border-red-500/30 bg-red-500/[0.06] text-red-300" : ""}
                      ${showFeedback && !isSelected && !isCorrect ? "border-white/[0.04] bg-white/[0.01] text-slate-600 opacity-50" : ""}
                    `}>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 border
                      ${showCorrect ? "bg-green-500/20 border-green-500/30 text-green-400" : ""}
                      ${showWrong   ? "bg-red-500/20 border-red-500/30 text-red-400" : ""}
                      ${!showFeedback ? "bg-white/[0.06] border-white/[0.1] text-slate-400" : ""}
                      ${showFeedback && !isSelected && !isCorrect ? "bg-white/[0.03] border-white/[0.05] text-slate-600" : ""}
                    `}>
                      {showCorrect ? "✓" : showWrong ? "✗" : OPTION_LABELS[i]}
                    </span>
                    <span className="text-sm font-medium leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
            {showFeedback && (
              <div className={`mx-4 mb-5 px-4 py-3 rounded-xl border text-sm leading-relaxed ${selected === q.correctId ? "border-green-500/20 bg-green-500/[0.05] text-green-300/80" : "border-orange-500/20 bg-orange-500/[0.05] text-orange-300/80"}`}>
                <span className="font-semibold mr-1">{selected === q.correctId ? "Exactly right!" : "Good to know:"}</span>
                {q.explanation}
                {isLast && isSubmitting && <span className="block mt-2 text-slate-400 text-xs">Calculating results…</span>}
              </div>
            )}
          </div>
          <div className="flex justify-center gap-1.5 mt-6">
            {questions.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i < currentIndex ? "w-2 h-2 bg-blue-500" : i === currentIndex ? "w-4 h-2 bg-blue-400" : "w-2 h-2 bg-white/[0.1]"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Milestone Complete ────────────────────────────────────────────────────────
function MilestoneComplete({ milestone, quizResult, gradient, projectId, nextMilestone }: {
  milestone: { order: number; title: string };
  quizResult: QuizResult | null;
  gradient: string;
  projectId: string;
  nextMilestone: { id: string; order: number; title: string } | null;
}) {
  return (
    <div className="min-h-screen bg-[#07080f] flex items-center justify-center p-5">
      <div className="w-full max-w-md space-y-5">
        <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.03] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Milestone Complete!</h2>
          <p className="text-green-400 font-semibold text-sm mb-4">{milestone.title}</p>
          {quizResult && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-300 text-sm font-bold">
              {quizResult.correct}/{quizResult.total} correct · {quizResult.score}%
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {nextMilestone && (
            <Link href={`/dashboard/project/${projectId}/milestone/${nextMilestone.order}`}
              className={`flex items-center justify-between px-5 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-semibold`}>
              <span className="flex flex-col items-start">
                <span className="text-[10px] opacity-70 uppercase tracking-wider">Next Milestone</span>
                <span className="truncate max-w-[220px]">{nextMilestone.title}</span>
              </span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          )}
          <Link href={`/dashboard/project/${projectId}/roadmap`}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] text-slate-400 text-sm font-medium transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            Back to Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
