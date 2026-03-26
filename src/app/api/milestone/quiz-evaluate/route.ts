import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scoreMilestoneQuiz, getMilestoneQuizFeedback, type QuizQuestion, type Answers } from "@/lib/quiz";
import { NextRequest, NextResponse } from "next/server";

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

  const { correct, total, score, passed } = scoreMilestoneQuiz(
    questions as QuizQuestion[],
    answers as Answers,
  );
  const feedback = getMilestoneQuizFeedback(score, passed);

  if (passed) {
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: "COMPLETED" },
    });
  }

  return NextResponse.json({ passed, score, correct, total, ...feedback });
}
