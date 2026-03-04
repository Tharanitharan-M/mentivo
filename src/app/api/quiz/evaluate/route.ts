import { generateObject } from "ai";
import { model } from "@/lib/ai";
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
    prompt: `A learner just completed a skill assessment for a coding project. Analyze their results.

Project they want to build: ${project.idea}
Score: ${score}/${questions.length} (${percentage.toFixed(0)}%)

Results breakdown:
${questionBreakdown}

Based on this, provide:
- level: their overall coding level (beginner/intermediate/advanced)
- levelLabel: a creative, friendly label like "Curious Beginner", "Confident Builder", or "Seasoned Architect"
- summary: 2-3 warm sentences explaining their level and how we'll tailor their learning path for this project specifically
- strengths: exactly 2-3 short phrases of what they already understand well
- focusAreas: exactly 2-3 short phrases of key concepts to focus on for their project
- encouragement: one short, punchy, genuinely motivating sentence
- nextStep: one sentence describing what we'll start with in their learning path

Be warm, specific to their project, and genuinely encouraging — every level is the perfect starting point.`,
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
