import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { userCardService } from "@/application/social/user-card.service";
import { getServerSession } from "@/lib/get-session";
import { cookies } from "next/headers";

const FAN_DEVICE_COOKIE = "matrix_fan_device_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

async function resolveDeviceId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(FAN_DEVICE_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const next = randomUUID();
  cookieStore.set(FAN_DEVICE_COOKIE, next, {
    path: "/",
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return next;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const targetUserId = params.id;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    }

    const session = await getServerSession();
    const viewerUserId = session?.user?.id;

    if (viewerUserId && viewerUserId === targetUserId) {
      return NextResponse.json(
        { error: "You cannot become a fan of your own profile" },
        { status: 400 },
      );
    }

    const deviceId = await resolveDeviceId();

    const result = await userCardService.toggleFan({
      targetUserId,
      viewerUserId,
      deviceId,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = message === "User not found" ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
