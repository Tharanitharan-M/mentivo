import { streamText, convertToModelMessages, UIMessage } from "ai";
import { model } from "@/lib/ai";
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
    system: `You are Mentivo, an expert and encouraging coding mentor helping a learner build their project step by step.

Project: "${project.idea}"
Current milestone (${milestone.order}): "${milestone.title}"
Core concept: ${milestone.concept}
What they're building: ${milestone.description}
Learner level: ${project.level ?? "beginner"}

${currentCode ? `Their current code:\n\`\`\`html\n${currentCode}\n\`\`\`` : "They haven't written any code yet."}

Your role in this workspace:
- Answer questions about the concept: ${milestone.concept}
- Help debug errors in their code — paste specific fixes with explanation
- Give progressive hints: vague → specific → show code snippet (never the full solution)
- Review code when asked — praise what's good, suggest improvements
- Keep energy high and responses concise (3–6 sentences usually)
- Use markdown code blocks when showing code

Important: If they seem stuck for a while, proactively offer a specific hint. 
If they share code, look at it carefully and give targeted feedback.`,
    messages: modelMessages,
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
