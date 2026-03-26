import { streamText, convertToModelMessages, UIMessage } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { withTracing } from "@/lib/tracing";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const messages: UIMessage[] = body.messages ?? [];
  const milestoneId: string = body.milestoneId;

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { roadmap: { include: { project: true } } },
  });

  if (!milestone || milestone.roadmap.project.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  const project = milestone.roadmap.project;

  // Persist user message
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role === "user") {
    const text = lastMsg.parts?.find((p: { type: string }) => p.type === "text") as
      | { type: string; text: string }
      | undefined;
    if (text?.text) {
      await prisma.milestoneMessage.create({
        data: { milestoneId, role: "user", content: text.text },
      });
    }
  }

  const modelMessages = await convertToModelMessages(messages);
  const currentCode = milestone.code ?? milestone.starterCode ?? "";

  const result = streamText({
    model,
    system: getPrompt("milestone-chat").template({
      idea: project.idea,
      milestoneOrder: milestone.order,
      milestoneTitle: milestone.title,
      concept: milestone.concept,
      description: milestone.description,
      level: project.level ?? "beginner",
      currentCode,
    }),
    messages: modelMessages,
    ...withTracing("milestone-chat", { userId: session.user.id, milestoneId }),
    onFinish: async ({ text }) => {
      await prisma.milestoneMessage.create({
        data: { milestoneId, role: "assistant", content: text },
      });
      // Mark as IN_PROGRESS if UNLOCKED
      if (milestone.status === "UNLOCKED") {
        await prisma.milestone.update({
          where: { id: milestoneId },
          data: { status: "IN_PROGRESS" },
        });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
