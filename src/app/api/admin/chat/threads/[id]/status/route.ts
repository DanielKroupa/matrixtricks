import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { adminThreadStatusSchema } from "@/app/helpers/chat-schema";
import { chatService } from "@/application/chat/chat.service";
import { serializeChatThread } from "@/app/api/chat/serialize";

export async function PATCH(
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
  const parsed = adminThreadStatusSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const params = await context.params;
  const thread = await chatService.setStatusByAdmin({
    adminUserId: user.id,
    threadId: params.id,
    status: parsed.data.status,
  });

  return NextResponse.json({
    thread: serializeChatThread(thread),
  });
}
