import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { chatService } from "@/services/chat/chat.service";
import { serializeChatThread } from "@/app/api/chat/serialize";

export async function POST() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const thread = await chatService.markReadAsUser(user.id);

  return NextResponse.json({
    thread: serializeChatThread(thread),
  });
}
