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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 },
      );
    }

    const session = await getServerSession();
    const viewerUserId = session?.user?.id;
    const viewerRole = session?.user?.role;
    const deviceId = await resolveDeviceId();

    const data = await userCardService.getUserCard({
      targetUserId: userId,
      viewerUserId,
      viewerRole,
      deviceId,
    });

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to get user card", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
