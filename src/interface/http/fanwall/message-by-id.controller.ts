import { NextResponse } from "next/server";
import { broadcastFanwallEvent } from "@/lib/fanwall-realtime";
import { getServerSession } from "@/lib/get-session";
import {
  resolveIdentityDeviceId,
  resolveIpAddressFromRequest,
} from "@/lib/request-identity";
import { fanwallUpdateSchema } from "@/lib/schemas/pageSchema/fanwall-schema";
import { userBlockService } from "@/services/moderation/user-block.service";
import { fanwallService } from "@/services/social/fanwall.service";

export async function handleFanwallMessagePatch(request: Request, id: string) {
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

  const existing = await fanwallService.getMessageById(id);

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
  if (wantsPinned !== undefined) {
    updateData.isPinned = wantsPinned;
  }

  const message = await fanwallService.updateMessage(id, updateData);

  await broadcastFanwallEvent("fanwall:updated", message);
  if (wantsPinned !== undefined) {
    await broadcastFanwallEvent("fanwall:refresh", { id: message.id });
  }

  return NextResponse.json({ message });
}

export async function handleFanwallMessageDelete(request: Request, id: string) {
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

  const existing = await fanwallService.getMessageById(id);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = existing.userId && existing.userId === user.id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await fanwallService.deleteMessage(id);
  await broadcastFanwallEvent("fanwall:deleted", { id });

  return NextResponse.json({ ok: true });
}
