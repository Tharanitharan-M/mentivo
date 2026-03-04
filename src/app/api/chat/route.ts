import { streamText, convertToModelMessages, UIMessage } from "ai";
import { model } from "@/lib/ai";
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
    system: `You are Mentivo, a warm and enthusiastic AI coding mentor. A learner has shared a project idea and you're helping them clarify it before building their personalized learning path.

The learner's project idea: "${project.idea}"

Your goal: Understand their project deeply through a friendly, energetic conversation. Ask focused questions to understand:
- Core functionality (what the app does exactly)
- Key features they want to build  
- Any technology preferences (web/mobile, languages they've heard of)
- Target users (is it for themselves? others?)

Guidelines:
- Be genuinely excited and warm — this is their big idea!
- Ask only 1-2 questions at a time, never a big list
- Keep it conversational, not like a form
- Do NOT ask about their coding skill level — we'll assess that separately
- After 2-3 exchanges where you feel you understand the project well, end your response with EXACTLY the marker: [READY_FOR_QUIZ]
  Then immediately follow it with a short, exciting 1-2 sentence summary of what they'll build.
  
Example ending: "[READY_FOR_QUIZ] Incredible — you're going to build a personal finance tracker with real-time spending charts and smart budgeting alerts. This is exactly the kind of practical project you'll actually use every day!"`,
    messages: modelMessages,
    onFinish: async ({ text }) => {
      await prisma.message.create({
        data: { projectId, role: "assistant", content: text },
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
