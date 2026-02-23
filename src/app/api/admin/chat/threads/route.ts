import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import {
  adminOpenThreadSchema,
  adminThreadListSchema,
} from "@/lib/helpers/chat-schema";
import { chatService } from "@/application/chat/chat.service";
import {
  serializeChatMessage,
  serializeChatThread,
} from "@/app/api/chat/serialize";

export async function GET(request: Request) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const parsed = adminThreadListSchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    query: url.searchParams.get("query") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const items = await chatService.listThreadsForAdmin(parsed.data);

  return NextResponse.json({
    items: items.map((item) => ({
      thread: serializeChatThread(item.thread),
      lastMessage: item.lastMessage
        ? serializeChatMessage(item.lastMessage)
        : null,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = adminOpenThreadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const thread = await chatService.getOrCreateThreadForAdminByUserId(
      parsed.data.userId,
    );

    return NextResponse.json({
      thread: serializeChatThread(thread),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
