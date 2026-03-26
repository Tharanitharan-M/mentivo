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
      options: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
        })
      ),
      correctId: z.string(),
      explanation: z.string(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      topic: z.string(),
    })
  ),
});

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
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "QUIZ" },
  });

  return NextResponse.json({ questions: object.questions });
}
