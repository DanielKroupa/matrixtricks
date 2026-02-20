import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { fanwallCreateSchema } from "@/app/helpers/fanwall-schema";
import { broadcastFanwallEvent } from "@/lib/fanwall-realtime";
import { userBlockService } from "@/application/moderation/user-block.service";
import {
  resolveIdentityDeviceId,
  resolveIpAddressFromRequest,
} from "@/lib/request-identity";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function serializeMessage(message: {
  id: string;
  body: string;
  title: string | null;
  nickname: string | null;
  contact: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    role: string | null;
  } | null;
}) {
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const beforeParam = url.searchParams.get("before");

  const parsedLimit = Number(limitParam ?? DEFAULT_LIMIT);
  const limit = Math.min(
    Number.isFinite(parsedLimit) ? parsedLimit : DEFAULT_LIMIT,
    MAX_LIMIT,
  );

  const includeUser = {
    user: {
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        role: true,
      },
    },
  } as const;

  if (beforeParam) {
    const beforeDate = new Date(beforeParam);
    if (Number.isNaN(beforeDate.getTime())) {
      // invalid before -> fallback to default behavior
      const messages = await prisma.fanWallMessage.findMany({
        take: limit,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: includeUser,
      });

      return NextResponse.json(
        { messages: messages.map(serializeMessage) },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const pinnedMessages = await prisma.fanWallMessage.findMany({
      where: { isPinned: true },
      orderBy: { createdAt: "desc" },
      include: includeUser,
    });

    const nonPinnedMessages = await prisma.fanWallMessage.findMany({
      where: { isPinned: false, createdAt: { lt: beforeDate } },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: includeUser,
    });

    const combined = [...pinnedMessages, ...nonPinnedMessages];

    return NextResponse.json(
      { messages: combined.map(serializeMessage) },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  // default behavior
  const messages = await prisma.fanWallMessage.findMany({
    take: limit,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: includeUser,
  });

  return NextResponse.json(
    { messages: messages.map(serializeMessage) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const session = await getServerSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const payload = await request.json();
  const parsed = fanwallCreateSchema.safeParse(payload);
  const deviceId = await resolveIdentityDeviceId();
  const ipAddress = resolveIpAddressFromRequest(request);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await userBlockService.assertCanWrite(
      {
        userId: user?.id ?? null,
        deviceId,
        ipAddress,
      },
      "FANWALL_CREATE",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  if (!user) {
    const nickname = parsed.data.nickname?.trim();
    const contact = parsed.data.contact?.trim();

    if (!nickname || !contact) {
      return NextResponse.json(
        { error: "Nickname and contact are required for anonymous posts." },
        { status: 400 },
      );
    }
  }

  const created = await prisma.fanWallMessage.create({
    data: {
      body: parsed.data.body.trim(),
      title: isAdmin ? parsed.data.title?.trim() || null : null,
      nickname: user ? null : parsed.data.nickname?.trim() || null,
      contact: user ? null : parsed.data.contact?.trim() || null,
      userId: user?.id ?? null,
    },
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

  const responsePayload = serializeMessage(created);
  await userBlockService.recordIdentity({
    userId: user?.id ?? null,
    deviceId,
    ipAddress,
    source: "FANWALL",
  });
  await broadcastFanwallEvent("fanwall:created", responsePayload);

  return NextResponse.json({ message: responsePayload }, { status: 201 });
}
