import { generateObject } from "ai";
import { model } from "@/lib/ai";
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
    prompt: `Generate exactly 6 multiple-choice quiz questions to assess a learner's coding skill level.

Project they want to build: ${project.idea}
${conversationSummary ? `Additional context from conversation: ${conversationSummary}` : ""}

Requirements:
- Questions 1-2: Beginner difficulty (what is HTML/CSS/JS, variables, loops, basic concepts)
- Questions 3-4: Intermediate difficulty (functions, components, APIs, databases, React)
- Questions 5-6: Advanced difficulty (architecture decisions, performance, design patterns, state management)
- Each question must have exactly 4 answer options
- Questions should be relevant to concepts needed to build their specific project
- Test understanding and practical thinking, not trivia or memorization
- Be friendly and educational in phrasing

IMPORTANT: For IDs, use exactly: question ids q1 through q6, option ids like q1_a, q1_b, q1_c, q1_d.
The correctId must match one of the option ids exactly.`,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "QUIZ" },
  });

  return NextResponse.json({ questions: object.questions });
}
