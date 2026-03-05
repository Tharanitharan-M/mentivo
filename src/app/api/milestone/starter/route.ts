import { generateObject } from "ai";
import { model } from "@/lib/ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const StarterSchema = z.object({
  html: z.string(),
  tasks: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      hint: z.string(),
      test: z.string(), // JS expression run in the preview iframe; must return true/false
    })
  ).min(3).max(4),
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
    prompt: `Generate starter HTML/CSS/JS code AND verifiable coding tasks for a milestone.

Project: "${project.idea}"
Milestone ${milestone.order}: "${milestone.title}"
Concept to teach: "${milestone.concept}"
What to build: "${milestone.description}"
Student level: ${level}

STARTER CODE rules:
${isFirst
  ? "- Clean HTML5 boilerplate with <style> and <script> blocks\n- TODO comments showing where to build\n- Just the skeleton, not the implementation"
  : "- Builds on earlier milestones (assume basic HTML structure exists)\n- Shows this milestone's feature scaffold\n- ~20-30% pre-filled to get them started"
}
- Under 70 lines, relevant to "${project.idea}", ${level === "beginner" ? "lots of guiding comments" : "clean code with few comments"}

TASKS rules (3–4 tasks):
- Each is a concrete, verifiable coding action (e.g. "Add a <form> element with id='expense-form'")
- Ordered from simple to complex — each builds on the previous
- Written as clear instructions ("Add", "Create", "Make", "Write")
- The hint should be a short code snippet or direction (one line)
- IDs: t1, t2, t3, t4
- Together, completing all tasks means the milestone is essentially built

For EACH task you MUST provide a "test" field: a short JavaScript expression that runs in the BROWSER (same window as the learner's page) and returns true if the task is done, false otherwise.
- Use only the DOM: document.getElementById, document.querySelector, document.querySelectorAll, element.matches, .value, etc.
- Must be a single expression or IIFE that evaluates to a boolean, e.g. "!!document.getElementById('expense-form')" or "(function(){ return document.querySelectorAll('input').length >= 2; })()"
- No document.write, no fetch, no external URLs. Must run synchronously.
- The learner's HTML/JS will already be loaded in the window when this runs.`,
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
