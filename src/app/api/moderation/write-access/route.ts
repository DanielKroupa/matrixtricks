import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import {
  resolveIdentityDeviceId,
  resolveIpAddressFromRequest,
} from "@/lib/request-identity";
import { userBlockService } from "@/services/moderation/user-block.service";
import type { WriteActionScope } from "@/types/moderation";

const allowedActions: WriteActionScope[] = [
  "COMMENT_CREATE",
  "COMMENT_UPDATE",
  "COMMENT_DELETE",
  "FANWALL_CREATE",
  "FANWALL_UPDATE",
  "FANWALL_DELETE",
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id ?? null;
    const deviceId = await resolveIdentityDeviceId();
    const ipAddress = resolveIpAddressFromRequest(request);

    const url = new URL(request.url);
    const actionParam = url.searchParams.get("action");

    const action = allowedActions.includes(actionParam as WriteActionScope)
      ? (actionParam as WriteActionScope)
      : null;

    if (!action) {
      return NextResponse.json(
        { error: "Invalid or missing action" },
        { status: 400 },
      );
    }

    const activeBlock = await userBlockService.getActiveWriteBlock(
      {
        userId,
        deviceId,
        ipAddress,
      },
      action,
    );

    if (!activeBlock) {
      return NextResponse.json({
        blocked: false,
      });
    }

    return NextResponse.json({
      blocked: true,
      reason: activeBlock.reason,
      endsAt: activeBlock.endsAt?.toISOString() ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
