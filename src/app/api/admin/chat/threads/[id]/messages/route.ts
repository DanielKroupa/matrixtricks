import { NextResponse } from "next/server";
import {
  serializeChatMessage,
  serializeChatThread,
} from "@/app/api/chat/serialize";
import { createChatMessageSchema } from "@/lib/chat-schema";
import { getServerSession } from "@/lib/get-session";
import { chatService } from "@/services/chat/chat.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = createChatMessageSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const params = await context.params;

  try {
    const result = await chatService.sendMessageAsAdmin({
      adminUserId: user.id,
      threadId: params.id,
      body: parsed.data.body,
    });

    return NextResponse.json({
      thread: serializeChatThread(result.thread),
      message: serializeChatMessage(result.message),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("not found") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
