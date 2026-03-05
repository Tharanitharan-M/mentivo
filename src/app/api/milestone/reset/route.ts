import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { milestoneId } = await req.json();
  if (!milestoneId) return NextResponse.json({ error: "milestoneId required" }, { status: 400 });

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: { include: { project: { select: { userId: true } } } } },
  });

  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const starterFiles = (milestone.starterFiles as Record<string, string> | null) ?? null;
  const starterCode = milestone.starterCode;
  if (!starterFiles && !starterCode) {
    return NextResponse.json({ error: "No starter code to reset to" }, { status: 400 });
  }

  const files: Record<string, string> = starterFiles ?? { "index.html": starterCode ?? "" };
  const code = files["index.html"] ?? starterCode ?? "";

  await prisma.$transaction(async (tx) => {
    await tx.milestone.update({
      where: { id: milestoneId },
      data: { files, code, completedTaskIds: [], status: "UNLOCKED" },
    });
    await tx.milestoneMessage.deleteMany({ where: { milestoneId } });
  });

  return NextResponse.json({ files, code });
}
