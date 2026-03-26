import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { StarterSchema } from "@/lib/schemas";
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

  // Return cached if both already generated
  if (milestone.starterCode && milestone.tasks) {
    const files = (milestone.files as Record<string, string> | null) ?? { "index.html": milestone.starterCode };
    return NextResponse.json({ code: milestone.starterCode, files, tasks: milestone.tasks });
  }

  const project = milestone.roadmap.project;
  const level = project.level ?? "beginner";
  const isFirst = milestone.order === 1;

  const { object } = await generateObject({
    model,
    schema: StarterSchema,
    prompt: getPrompt("milestone-starter").template({
      idea: project.idea,
      milestoneOrder: milestone.order,
      milestoneTitle: milestone.title,
      concept: milestone.concept,
      description: milestone.description,
      level,
      isFirst,
    }),
    ...withTracing("milestone-starter", { userId: session.user.id, milestoneId }),
  });

  const html = milestone.starterCode ?? object.html;
  const files = (milestone.files as Record<string, string> | null) ?? { "index.html": html };

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      starterCode: milestone.starterCode ?? html,
      starterFiles: milestone.starterFiles ?? files, // keep original for "Reset milestone"
      code: milestone.code ?? html,
      files: milestone.files ?? files,
      tasks: milestone.tasks ?? object.tasks,
    },
  });

  return NextResponse.json({
    code: html,
    files,
    tasks: milestone.tasks ?? object.tasks,
  });
}
