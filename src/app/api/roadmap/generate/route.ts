import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { RoadmapSchema } from "@/lib/schemas";
import { withTracing } from "@/lib/tracing";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
    prompt: getPrompt("roadmap-generate").template({
      idea: project.idea,
      level: quizLevel as "beginner" | "intermediate" | "advanced",
    }),
    ...withTracing("roadmap-generate", { userId: session.user.id, projectId }),
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
