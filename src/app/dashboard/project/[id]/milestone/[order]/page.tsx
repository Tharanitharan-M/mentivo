import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import type { UIMessage } from "ai";
import WorkspaceClient from "./WorkspaceClient";

interface PageProps {
  params: Promise<{ id: string; order: string }>;
}

export default async function MilestonePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id, order } = await params;
  const orderNum = parseInt(order);
  if (isNaN(orderNum)) notFound();

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      roadmap: {
        include: { milestones: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!project || !project.roadmap) notFound();

  const milestone = project.roadmap.milestones.find((m) => m.order === orderNum);
  if (!milestone) notFound();

  const allMilestones = project.roadmap.milestones;
  const nextMilestone = allMilestones.find((m) => m.order === orderNum + 1) ?? null;
  const prevMilestone = allMilestones.find((m) => m.order === orderNum - 1) ?? null;

  // Load chat history for this milestone
  const rawMessages = await prisma.milestoneMessage.findMany({
    where: { milestoneId: milestone.id },
    orderBy: { createdAt: "asc" },
  });

  const chatHistory: UIMessage[] = rawMessages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
    metadata: undefined,
  }));

  return (
    <WorkspaceClient
      project={{
        id: project.id,
        title: project.title,
        idea: project.idea,
        level: project.level,
      }}
      milestone={{
        id: milestone.id,
        order: milestone.order,
        title: milestone.title,
        concept: milestone.concept,
        description: milestone.description,
        estimatedTime: milestone.estimatedTime,
        difficulty: milestone.difficulty,
        tags: milestone.tags,
        status: milestone.status,
        conceptContent: milestone.conceptContent,
        starterCode: milestone.starterCode,
        code: milestone.code,
        tasks: milestone.tasks as { id: string; text: string; hint: string }[] | null,
        completedTaskIds: milestone.completedTaskIds,
      }}
      totalMilestones={allMilestones.length}
      nextMilestone={nextMilestone ? { id: nextMilestone.id, order: nextMilestone.order, title: nextMilestone.title } : null}
      prevMilestone={prevMilestone ? { order: prevMilestone.order, title: prevMilestone.title } : null}
      chatHistory={chatHistory}
    />
  );
}
