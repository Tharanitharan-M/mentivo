import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import RoadmapClient from "./RoadmapClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoadmapPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      roadmap: {
        include: { milestones: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!project) notFound();

  // If no roadmap yet (e.g. direct URL), generate it on the server
  if (!project.roadmap) {
    redirect(`/dashboard/project/${id}`);
  }

  return (
    <RoadmapClient
      project={{ id: project.id, title: project.title, idea: project.idea, level: project.level }}
      milestones={project.roadmap.milestones}
      userName={session.user.name ?? "there"}
    />
  );
}
