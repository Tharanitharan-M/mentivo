import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { withTracing } from "@/lib/tracing";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

interface Task { id: string; text: string; hint: string }

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { milestoneId, completedIds: clientCompletedIds, code, tasks } = body;

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    select: { roadmap: { select: { project: { select: { userId: true } } } } },
  });
  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Client ran automated tests and sent results — no AI, just persist
  if (Array.isArray(clientCompletedIds)) {
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { completedTaskIds: clientCompletedIds },
    });
    return NextResponse.json({ completedIds: clientCompletedIds });
  }

  // Backward compat: no test code (e.g. old milestones) — use AI to check
  if (!tasks || tasks.length === 0 || !code?.trim()) {
    return NextResponse.json({ completedIds: [] });
  }

  const { object } = await generateObject({
    model,
    schema: z.object({ completedIds: z.array(z.string()) }),
    prompt: getPrompt("milestone-verify-tasks").template({
      taskList: (tasks as Task[]).map((t) => `${t.id}: ${t.text}`).join("\n"),
      taskIds: (tasks as Task[]).map((t) => t.id).join(", "),
      code: String(code).slice(0, 2500),
    }),
    ...withTracing("milestone-verify-tasks", { userId: session.user.id, milestoneId }),
  });

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { completedTaskIds: object.completedIds },
  });

  return NextResponse.json({ completedIds: object.completedIds });
}
