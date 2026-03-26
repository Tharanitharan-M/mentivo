import { generateText } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { withTracing } from "@/lib/tracing";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimitResponse } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limited = rateLimitResponse(session.user.id);
  if (limited) return limited;

  const { milestoneId, projectId } = await req.json();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: { include: { project: true } } },
  });

  if (!milestone || milestone.roadmap.project.id !== projectId || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (milestone.conceptContent) {
    return NextResponse.json({ content: milestone.conceptContent });
  }

  const project = milestone.roadmap.project;
  const level = project.level ?? "beginner";

  const { text } = await generateText({
    model,
    prompt: getPrompt("milestone-concept").template({
      concept: milestone.concept,
      idea: project.idea,
      level,
    }),
    ...withTracing("milestone-concept", { userId: session.user.id, milestoneId }),
  });

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { conceptContent: text },
  });

  return NextResponse.json({ content: text });
}
