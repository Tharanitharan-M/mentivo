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
    prompt: `Generate exactly 4 multiple-choice questions to check understanding of a coding milestone.

Milestone: "${milestone.title}"
Concept taught: "${milestone.concept}"
What they built: "${milestone.description}"
Project context: "${project.idea}"
Student level: ${project.level ?? "beginner"}
${userCode ? `Their code:\n\`\`\`html\n${userCode.slice(0, 800)}\n\`\`\`` : ""}

Requirements:
- 4 questions total: 2 concept questions + 1 practical "what does this code do" + 1 "what would happen if..."
- Each question has exactly 4 options
- Questions test understanding of ${milestone.concept}, not just memorization
- Be specific to what they just built
- Questions should be achievable for a ${project.level ?? "beginner"} level student

IDs: question ids q1–q4, option ids q1_a, q1_b, q1_c, q1_d etc.
The correctId must exactly match one of the option ids.`,
  });

  return NextResponse.json({ questions: object.questions });
}
