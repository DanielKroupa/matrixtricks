import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { chatService } from "@/services/chat/chat.service";

export async function GET() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ unreadCount: 0 });
  }

  if (user.role === "admin") {
    return NextResponse.json({ unreadCount: 0 });
  }

  const unreadCount = await chatService.getUserUnreadCount(user.id);

  return NextResponse.json({ unreadCount });
}
