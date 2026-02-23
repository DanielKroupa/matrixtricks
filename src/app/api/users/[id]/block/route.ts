import { NextResponse } from "next/server";
import { createUserBlockSchema } from "@/lib/helpers/user-block-schema";
import { userBlockService } from "@/services/moderation/user-block.service";
import { getServerSession } from "@/lib/get-session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await context.params;
    const targetUserId = params.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: "You cannot block yourself" },
        { status: 400 },
      );
    }

    const payload = await request.json();
    const parsed = createUserBlockSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : null;

    if (endsAt && Number.isNaN(endsAt.getTime())) {
      return NextResponse.json({ error: "Invalid endsAt" }, { status: 400 });
    }

    const block = await userBlockService.blockUserByAdmin({
      targetUserId,
      createdByUserId: user.id,
      reason: parsed.data.reason.trim(),
      endsAt,
      scopes: parsed.data.scopes,
    });

    return NextResponse.json({
      block: {
        id: block.id,
        endsAt: block.endsAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = await context.params;
    const targetUserId = params.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    }

    const revoked = await userBlockService.unblockUserByAdmin(
      targetUserId,
      user.id,
    );

    if (!revoked) {
      return NextResponse.json(
        { error: "No active block found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
