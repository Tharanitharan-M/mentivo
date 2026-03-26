import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { QuizSchema } from "@/lib/schemas";
import { withTracing } from "@/lib/tracing";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    ...withTracing("milestone-quiz-generate", { userId: session.user.id, milestoneId }),
  });

  return NextResponse.json({ questions: object.questions });
}
