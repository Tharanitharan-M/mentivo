import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

interface QuizQuestion {
  id: string;
  question: string;
  correctId: string;
  difficulty: string;
  topic: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, questions, answers } = await req.json();

  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const score = (questions as QuizQuestion[]).reduce(
    (acc: number, q: QuizQuestion) => acc + (answers[q.id] === q.correctId ? 1 : 0),
    0
  );
  const percentage = (score / questions.length) * 100;

  const questionBreakdown = (questions as QuizQuestion[])
    .map(
      (q: QuizQuestion, i: number) =>
        `Q${i + 1} [${q.difficulty}] ${q.topic}: ${answers[q.id] === q.correctId ? "✓ Correct" : "✗ Incorrect"}`
    )
    .join("\n");

  const { object } = await generateObject({
    model,
    schema: z.object({
      level: z.enum(["beginner", "intermediate", "advanced"]),
      levelLabel: z.string(),
      summary: z.string(),
      strengths: z.array(z.string()),
      focusAreas: z.array(z.string()),
      encouragement: z.string(),
      nextStep: z.string(),
    }),
    prompt: getPrompt("quiz-evaluate").template({
      idea: project.idea,
      score,
      total: questions.length,
      percentage,
      questionBreakdown,
    }),
  });

  await prisma.quiz.upsert({
    where: { projectId },
    create: {
      projectId,
      questions,
      answers,
      score: percentage,
      level: object.level,
      completedAt: new Date(),
    },
    update: {
      answers,
      score: percentage,
      level: object.level,
      completedAt: new Date(),
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { level: object.level, status: "ACTIVE" },
  });

  return NextResponse.json(object);
}
