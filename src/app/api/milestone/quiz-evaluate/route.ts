import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Question {
  id: string;
  correctId: string;
  difficulty: string;
  topic: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { milestoneId, questions, answers } = await req.json();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: { include: { project: { select: { userId: true } } } } },
  });

  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const correct = (questions as Question[]).filter(
    (q) => answers[q.id] === q.correctId
  ).length;
  const total = questions.length;
  const score = Math.round((correct / total) * 100);
  const passed = score >= 75;

  if (passed) {
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: "COMPLETED" },
    });
  }

  // Feedback messages based on score
  const messages = {
    perfect: { title: "Perfect score! 🎉", body: "You've completely nailed this concept. On to the next challenge!" },
    great:   { title: "Great job! ✨",      body: "You've got this concept down solid. Keep that momentum going!" },
    passed:  { title: "You passed! 👍",     body: "Good understanding of the concept. A few gaps, but you're ready to move on." },
    retry:   { title: "Almost there!",      body: "Review the concept and try again — you're closer than you think." },
  };

  const feedback =
    score === 100 ? messages.perfect :
    score >= 88  ? messages.great :
    passed       ? messages.passed :
                   messages.retry;

  return NextResponse.json({ passed, score, correct, total, ...feedback });
}
