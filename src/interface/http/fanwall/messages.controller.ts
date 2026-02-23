import { NextResponse } from "next/server";
import { userBlockService } from "@/application/moderation/user-block.service";
import { fanwallService } from "@/application/social/fanwall.service";
import { fanwallCreateSchema } from "@/interface/schemas/social/fanwall.schema";
import { broadcastFanwallEvent } from "@/lib/fanwall-realtime";
import { getServerSession } from "@/lib/get-session";
import {
  resolveIdentityDeviceId,
  resolveIpAddressFromRequest,
} from "@/lib/request-identity";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function handleFanwallMessagesGet(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const beforeParam = url.searchParams.get("before");

  const parsedLimit = Number(limitParam ?? DEFAULT_LIMIT);
  const limit = Math.min(
    Number.isFinite(parsedLimit) ? parsedLimit : DEFAULT_LIMIT,
    MAX_LIMIT,
  );

  const messages = await fanwallService.listMessages({
    limit,
    before: beforeParam,
  });

  return NextResponse.json(
    { messages },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function handleFanwallMessagesPost(request: Request) {
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

  const message = await fanwallService.createMessage({
    body: parsed.data.body.trim(),
    title: isAdmin ? parsed.data.title?.trim() || null : null,
    nickname: user ? null : parsed.data.nickname?.trim() || null,
    contact: user ? null : parsed.data.contact?.trim() || null,
    userId: user?.id ?? null,
  });

  await userBlockService.recordIdentity({
    userId: user?.id ?? null,
    deviceId,
    ipAddress,
    source: "FANWALL",
  });

  await broadcastFanwallEvent("fanwall:created", message);

  return NextResponse.json({ message }, { status: 201 });
}
