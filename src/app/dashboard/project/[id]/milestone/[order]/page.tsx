import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import MilestoneConceptClient from "./MilestoneConceptClient";

interface PageProps {
  params: Promise<{ id: string; order: string }>;
}

export default async function MilestoneConceptPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id, order } = await params;
  const orderNum = parseInt(order);
  if (isNaN(orderNum)) notFound();

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      roadmap: {
        include: {
          milestones: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!project || !project.roadmap) notFound();

  const milestone = project.roadmap.milestones.find((m) => m.order === orderNum);
  if (!milestone) notFound();

  const totalMilestones = project.roadmap.milestones.length;
  const nextMilestone = project.roadmap.milestones.find((m) => m.order === orderNum + 1) ?? null;

  return (
    <MilestoneConceptClient
      project={{ id: project.id, title: project.title, idea: project.idea, level: project.level }}
      milestone={{
        id: milestone.id,
        order: milestone.order,
        title: milestone.title,
        concept: milestone.concept,
        description: milestone.description,
        estimatedTime: milestone.estimatedTime,
        difficulty: milestone.difficulty,
        tags: milestone.tags,
        cachedContent: milestone.conceptContent,
      }}
      totalMilestones={totalMilestones}
      nextMilestone={nextMilestone ? { order: nextMilestone.order, title: nextMilestone.title } : null}
    />
  );
}
