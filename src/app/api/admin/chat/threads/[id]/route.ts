import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { chatService } from "@/services/chat/chat.service";
import {
  serializeChatMessage,
  serializeChatThread,
} from "@/app/api/chat/serialize";

export async function GET(
  _request: Request,
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

  const params = await context.params;

  try {
    const result = await chatService.getThreadMessagesForAdmin(params.id);
    return NextResponse.json({
      thread: serializeChatThread(result.thread),
      messages: result.messages.map(serializeChatMessage),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not found";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
