import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import FanWallClient from "./FanWallClient";
import { entitlementService } from "@/application/billing/entitlement.service";

export async function FanWall() {
  const session = await getServerSession();
  const user = session?.user ?? null;
  const isAdmin = user?.role === "admin";

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

  const candidateUserIds = [
    ...(user?.id ? [user.id] : []),
    ...messages
      .map((message) => message.user?.id)
      .filter((id): id is string => Boolean(id)),
  ];

  const vipStatusMap =
    await entitlementService.getVipStatusMap(candidateUserIds);

  const sessionUser = user
    ? {
        id: user.id,
        name: user.name ?? null,
        username: user.username ?? null,
        image: user.image ?? null,
        role: user.role ?? null,
        isVipActive: vipStatusMap.get(user.id) ?? false,
      }
    : null;

  const serializedMessages = messages.map((message) => ({
    ...message,
    user: message.user
      ? {
          ...message.user,
          isVipActive: vipStatusMap.get(message.user.id) ?? false,
        }
      : null,
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
