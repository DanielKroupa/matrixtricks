import { NextResponse } from "next/server";
import { serializeChatThread } from "@/app/api/chat/serialize";
import { getServerSession } from "@/lib/get-session";
import { chatService } from "@/services/chat/chat.service";

export async function POST(
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
  const thread = await chatService.markReadAsAdmin(params.id);

  return NextResponse.json({ thread: serializeChatThread(thread) });
}
