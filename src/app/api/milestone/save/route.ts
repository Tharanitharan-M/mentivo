import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { milestoneId, code, files, completedTaskIds } = await req.json();

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: { include: { project: { select: { userId: true } } } } },
  });

  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: { code?: string; files?: Record<string, string>; completedTaskIds?: string[]; status: "UNLOCKED" | "LOCKED" | "IN_PROGRESS" | "COMPLETED" } = {
    status: milestone.status === "UNLOCKED" ? "IN_PROGRESS" : milestone.status,
  };
  if (files !== undefined && typeof files === "object" && files !== null) {
    data.files = files as Record<string, string>;
    const indexHtml = (files as Record<string, string>)["index.html"];
    if (typeof indexHtml === "string") data.code = indexHtml;
  } else if (code !== undefined) {
    data.code = code;
  }
  if (completedTaskIds !== undefined) data.completedTaskIds = completedTaskIds;

  await prisma.milestone.update({
    where: { id: milestoneId },
    data,
  });

  return NextResponse.json({ success: true });
}
