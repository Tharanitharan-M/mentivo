import { generateText } from "ai";
import { model } from "@/lib/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    prompt: `Write a SHORT, punchy concept explanation for a coding lesson.

Concept: "${milestone.concept}"
Project context: "${project.idea}"
Student level: ${level}

Format exactly like this — keep it brief:

# ${milestone.concept}

[2–3 sentences only. Define what ${milestone.concept} is in plain language. One analogy if it helps.]

\`\`\`html
[ONE focused code example, 8–14 lines, directly related to "${project.idea}"]
\`\`\`

[1–2 sentences: how this concept is used when building "${project.idea}". Be specific.]

Rules:
- Total output: 150–200 words maximum
- No extra sections, no bullet points, no headers beyond the title
- The code example must be the most important illustration of the concept
- Write for a ${level} student — simple words, concrete ideas`,
  });

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { conceptContent: text },
  });

  return NextResponse.json({ content: text });
}
