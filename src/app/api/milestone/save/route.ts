import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { milestoneId, code, completedTaskIds } = await req.json();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: { include: { project: { select: { userId: true } } } } },
  });

  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      code,
      ...(completedTaskIds !== undefined && { completedTaskIds }),
      status: milestone.status === "UNLOCKED" ? "IN_PROGRESS" : milestone.status,
    },
  });

  return NextResponse.json({ success: true });
}
