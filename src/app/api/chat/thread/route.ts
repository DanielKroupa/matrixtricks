import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { chatService } from "@/application/chat/chat.service";
import {
  serializeChatMessage,
  serializeChatThread,
} from "@/app/api/chat/serialize";

export async function GET() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { thread, messages } =
    await chatService.getOrCreateUserThreadWithMessages(user.id);

  return NextResponse.json({
    thread: serializeChatThread(thread),
    messages: messages.map(serializeChatMessage),
  });
}
