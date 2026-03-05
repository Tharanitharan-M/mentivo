import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RoadmapSchema = z.object({
  milestones: z.array(
    z.object({
      order: z.number(),
      title: z.string(),
      description: z.string(),
      concept: z.string(),
      estimatedTime: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      tags: z.array(z.string()),
    })
  ),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await req.json();

  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: session.user.id },
    include: { quiz: true, roadmap: { include: { milestones: { orderBy: { order: "asc" } } } } },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Return existing roadmap if already generated
  if (project.roadmap) {
    return NextResponse.json({ roadmap: project.roadmap });
  }

  const level = project.level ?? "beginner";
  const quizLevel = project.quiz?.level ?? level;

  const { object } = await generateObject({
    model,
    schema: RoadmapSchema,
    prompt: `Create a milestone-based learning roadmap for a student building their project.

Project idea: "${project.idea}"
Student level: ${quizLevel}

Generate exactly 7 milestones that progressively build the complete project from scratch.

Guidelines:
- Each milestone builds directly on the previous one — they form a continuous project
- Each milestone should be completable in 2–4 hours of focused work
- Each teaches exactly ONE main programming concept
- Milestone 1 should be "Set up the project" — environment, file structure, basic scaffold
- Final milestone should result in a fully working, deployable project
- Concept names should be specific (e.g. "Event Listeners" not just "JavaScript")
- Tags should be 2–4 specific technologies or concepts (e.g. ["HTML", "CSS Grid", "Flexbox"])
- Descriptions should be 2 sentences: what they'll build + what they'll learn
- For ${quizLevel} level: ${quizLevel === "beginner" ? "start from absolute basics, no assumed knowledge" : quizLevel === "intermediate" ? "assume basic HTML/CSS/JS knowledge, dive deeper" : "assume solid fundamentals, focus on architecture and best practices"}
- estimatedTime examples: "1–2 hours", "2–3 hours", "3–4 hours"`,
  });

  // Save roadmap + milestones to DB
  const roadmap = await prisma.roadmap.create({
    data: {
      projectId,
      milestones: {
        create: object.milestones.map((m) => ({
          order: m.order,
          title: m.title,
          description: m.description,
          concept: m.concept,
          estimatedTime: m.estimatedTime,
          difficulty: m.difficulty,
          tags: m.tags,
          status: "UNLOCKED",
        })),
      },
    },
    include: { milestones: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ roadmap });
}
