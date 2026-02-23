import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { createChatMessageSchema } from "@/lib/helpers/chat-schema";
import { chatService } from "@/services/chat/chat.service";
import {
  serializeChatMessage,
  serializeChatThread,
} from "@/app/api/chat/serialize";

export async function POST(request: Request) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "admin") {
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

  try {
    const result = await chatService.sendMessageAsUser({
      userId: user.id,
      body: parsed.data.body,
    });

    return NextResponse.json({
      thread: serializeChatThread(result.thread),
      message: serializeChatMessage(result.message),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden";
    const status = message.includes("Rate limit") ? 429 : 403;

    return NextResponse.json({ error: message }, { status });
  }
}
