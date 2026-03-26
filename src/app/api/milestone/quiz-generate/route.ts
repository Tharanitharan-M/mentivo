import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const QuizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.object({ id: z.string(), text: z.string() })),
      correctId: z.string(),
      explanation: z.string(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      topic: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { milestoneId } = await req.json();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: { include: { project: true } } },
  });

  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const project = milestone.roadmap.project;
  const userCode = milestone.code ?? "";

  const { object } = await generateObject({
    model,
    schema: QuizSchema,
    prompt: getPrompt("milestone-quiz-generate").template({
      milestoneTitle: milestone.title,
      concept: milestone.concept,
      description: milestone.description,
      idea: project.idea,
      level: project.level ?? "beginner",
      userCode: userCode.slice(0, 800),
    }),
  });

  return NextResponse.json({ questions: object.questions });
}
