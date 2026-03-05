import { generateText } from "ai";
import { model } from "@/lib/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { milestoneId, projectId } = await req.json();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: { include: { project: true } } },
  });

  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Return cached concept if already generated
  if (milestone.conceptContent) {
    return NextResponse.json({ content: milestone.conceptContent });
  }

  const project = milestone.roadmap.project;
  const level = project.level ?? "beginner";

  const { text } = await generateText({
    model,
    prompt: `Write a clear, engaging concept guide for a coding student.

Concept to teach: "${milestone.concept}"
Project they're building: "${project.idea}"
Milestone: "${milestone.title}" (Milestone ${milestone.order} of their project)
Student level: ${level}

Write a comprehensive but approachable guide in Markdown. Structure it EXACTLY like this:

## What is ${milestone.concept}?
[2–3 paragraphs. Explain it in plain English like you're a friendly senior developer. No jargon without explanation. Use an analogy if helpful.]

## Why you need this for your project
[1–2 paragraphs. Be specific to "${project.idea}". Show exactly HOW this concept will be used in their actual project.]

## How it works
[Explain the mechanics. Include 1–2 short, well-commented code examples. Keep examples simple and relevant to their project.]

\`\`\`javascript
// A clear, commented example
\`\`\`

## Common mistakes beginners make
[3–4 bullet points of real gotchas. Be specific, not generic.]

## Key takeaways
[4–5 bullet points summarising what they should remember before building]

Guidelines:
- Write for ${level} level — ${level === "beginner" ? "assume zero prior knowledge, explain everything" : level === "intermediate" ? "assume basic knowledge, focus on depth and best practices" : "assume solid fundamentals, discuss trade-offs and patterns"}
- Be warm and encouraging, not dry and academic
- Keep code examples under 20 lines each
- Do NOT include quiz questions or exercises
- Total length: 400–600 words`,
  });

  // Cache the concept content
  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { conceptContent: text },
  });

  return NextResponse.json({ content: text });
}
