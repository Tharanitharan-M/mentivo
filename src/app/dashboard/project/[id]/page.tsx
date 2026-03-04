import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import type { UIMessage } from "ai";
import ProjectClient from "./ProjectClient";

export interface QuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topic: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      quiz: true,
    },
  });

  if (!project) notFound();

  // Convert DB messages to UIMessage format (AI SDK v6)
  const initialMessages: UIMessage[] = project.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
    metadata: undefined,
  }));

  return (
    <ProjectClient
      project={{
        id: project.id,
        idea: project.idea,
        title: project.title,
        status: project.status,
        level: project.level,
      }}
      initialMessages={initialMessages}
      existingQuiz={
        project.quiz
          ? {
              questions: project.quiz.questions as unknown as QuizQuestion[],
              answers: (project.quiz.answers as Record<string, string>) ?? {},
              score: project.quiz.score,
              level: project.quiz.level,
            }
          : null
      }
      userName={session.user.name ?? "there"}
      isNew={project.messages.length === 0}
    />
  );
}
