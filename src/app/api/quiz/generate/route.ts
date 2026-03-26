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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, conversationSummary } = await req.json();

  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { object } = await generateObject({
    model,
    schema: QuizSchema,
    prompt: getPrompt("quiz-generate").template({ idea: project.idea, conversationSummary }),
    ...withTracing("quiz-generate", { userId: session.user.id, projectId }),
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "QUIZ" },
  });

  return NextResponse.json({ questions: object.questions });
}
