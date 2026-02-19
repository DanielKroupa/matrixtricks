import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import FanWallClient from "./FanWallClient";

export async function FanWall() {
  const session = await getServerSession();
  const user = session?.user ?? null;
  const isAdmin = user?.role === "admin";
  const sessionUser = user
    ? {
        id: user.id,
        name: user.name ?? null,
        username: user.username ?? null,
        image: user.image ?? null,
        role: user.role ?? null,
      }
    : null;

  const messages = await prisma.fanWallMessage.findMany({
    take: 50,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          role: true,
        },
      },
    },
  });

  const serializedMessages = messages.map((message) => ({
    ...message,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  }));

  return (
    <FanWallClient
      initialMessages={serializedMessages}
      sessionUser={sessionUser}
      isAdmin={isAdmin}
    />
  );
}
