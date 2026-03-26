import { streamText, convertToModelMessages, UIMessage } from "ai";
import { model } from "@/lib/ai";
import { getPrompt } from "@/lib/prompts";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const messages: UIMessage[] = body.messages ?? [];
  const projectId: string = body.projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: session.user.id },
  });

  if (!project) {
    return new Response("Project not found", { status: 404 });
  }

  // Persist the latest user message
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user") {
    const textPart = lastMessage.parts?.find(
      (p: { type: string }) => p.type === "text"
    ) as { type: string; text: string } | undefined;
    if (textPart?.text) {
      await prisma.message.create({
        data: { projectId, role: "user", content: textPart.text },
      });
    }
  }

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model,
    system: getPrompt("onboarding-chat").template({ idea: project.idea }),
    messages: modelMessages,
    onFinish: async ({ text }) => {
      await prisma.message.create({
        data: { projectId, role: "assistant", content: text },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
