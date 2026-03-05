import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await req.json();
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: session.user.id },
    include: { roadmap: true, quiz: true },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    if (project.roadmap) await tx.roadmap.delete({ where: { id: project.roadmap.id } });
    if (project.quiz) await tx.quiz.delete({ where: { id: project.quiz.id } });
    await tx.message.deleteMany({ where: { projectId } });
    await tx.project.update({
      where: { id: projectId },
      data: { status: "ONBOARDING", level: null },
    });
  });

  return NextResponse.json({ success: true });
}
