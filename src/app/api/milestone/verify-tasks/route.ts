import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

interface Task { id: string; text: string; hint: string }

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { milestoneId, code, tasks } = await req.json();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    select: { roadmap: { select: { project: { select: { userId: true } } } } },
  });
  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!tasks || tasks.length === 0 || !code?.trim()) {
    return NextResponse.json({ completedIds: [] });
  }

  const { object } = await generateObject({
    model,
    schema: z.object({ completedIds: z.array(z.string()) }),
    prompt: `Check which coding tasks the learner has completed in their code.

Tasks (id: description):
${(tasks as Task[]).map((t) => `${t.id}: ${t.text}`).join("\n")}

Learner's code:
\`\`\`html
${String(code).slice(0, 2500)}
\`\`\`

Return only the IDs of tasks that are clearly addressed in the code.
Be fairly liberal — if they've made a genuine attempt at the task, count it complete.
Only return IDs from this list: [${(tasks as Task[]).map((t) => t.id).join(", ")}]`,
  });

  // Persist to DB
  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { completedTaskIds: object.completedIds },
  });

  return NextResponse.json({ completedIds: object.completedIds });
}
