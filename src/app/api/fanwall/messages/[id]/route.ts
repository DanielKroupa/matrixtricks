import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { fanwallUpdateSchema } from "@/app/helpers/fanwall-schema";
import { broadcastFanwallEvent } from "@/lib/fanwall-realtime";
import { userBlockService } from "@/application/moderation/user-block.service";
import {
  resolveIdentityDeviceId,
  resolveIpAddressFromRequest,
} from "@/lib/request-identity";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const deviceId = await resolveIdentityDeviceId();
  const ipAddress = resolveIpAddressFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await userBlockService.assertCanWrite(
      {
        userId: user.id,
        deviceId,
        ipAddress,
      },
      "FANWALL_UPDATE",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = fanwallUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await prisma.fanWallMessage.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = existing.userId && existing.userId === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updateData: {
    body?: string;
    title?: string | null;
    isPinned?: boolean;
  } = {};

  if (parsed.data.body !== undefined) {
    updateData.body = parsed.data.body.trim();
  }

  if (isAdmin && parsed.data.title !== undefined) {
    updateData.title = parsed.data.title?.trim() || null;
  }

  const wantsPinned = isAdmin ? parsed.data.isPinned : undefined;

  let updated = null as null | {
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
  };

  if (wantsPinned === true) {
    updated = await prisma.$transaction(async (tx) => {
      await tx.fanWallMessage.updateMany({
        where: { isPinned: true },
        data: { isPinned: false },
      });

      return tx.fanWallMessage.update({
        where: { id },
        data: { ...updateData, isPinned: true },
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
    });
  } else {
    updated = await prisma.fanWallMessage.update({
      where: { id },
      data: {
        ...updateData,
        ...(wantsPinned !== undefined ? { isPinned: wantsPinned } : {}),
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
  }

  const responsePayload = serializeMessage(updated);

  await broadcastFanwallEvent("fanwall:updated", responsePayload);
  if (wantsPinned !== undefined) {
    await broadcastFanwallEvent("fanwall:refresh", { id: updated.id });
  }

  return NextResponse.json({ message: responsePayload });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const deviceId = await resolveIdentityDeviceId();
  const ipAddress = resolveIpAddressFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await userBlockService.assertCanWrite(
      {
        userId: user.id,
        deviceId,
        ipAddress,
      },
      "FANWALL_DELETE",
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  const existing = await prisma.fanWallMessage.findUnique({
    where: { id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = existing.userId && existing.userId === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.fanWallMessage.delete({ where: { id } });

  await broadcastFanwallEvent("fanwall:deleted", { id });

  return NextResponse.json({ ok: true });
}
