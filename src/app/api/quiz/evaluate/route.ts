import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { QuizEvaluateSchema } from "@/lib/schemas";
import { scoreSkillQuiz, type QuizQuestion, type Answers } from "@/lib/quiz";
import { withTracing } from "@/lib/tracing";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimitResponse } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limited = rateLimitResponse(session.user.id);
  if (limited) return limited;

  const { projectId, questions, answers } = await req.json();

  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { score, percentage, questionBreakdown } = scoreSkillQuiz(
    questions as QuizQuestion[],
    answers as Answers,
  );

  const { object } = await generateObject({
    model,
    schema: QuizEvaluateSchema,
    prompt: getPrompt("quiz-evaluate").template({
      idea: project.idea,
      score,
      total: questions.length,
      percentage,
      questionBreakdown,
    }),
    ...withTracing("quiz-evaluate", { userId: session.user.id, projectId }),
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
