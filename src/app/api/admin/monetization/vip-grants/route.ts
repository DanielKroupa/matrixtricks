import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import {
  createManualVipGrantSchema,
  listVipGrantsQuerySchema,
} from "@/app/helpers/admin-monetization-schema";
import { adminVipService } from "@/application/billing/admin-vip.service";

function ensureAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  return Boolean(session?.user && session.user.role === "admin");
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const parsedQuery = listVipGrantsQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const grants = await adminVipService.listRecentGrants(
      parsedQuery.data.limit ?? 50,
    );

    return NextResponse.json({ grants });
  } catch (error) {
    console.error("Failed to list VIP grants", error);
    return NextResponse.json(
      { error: "Failed to list VIP grants" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!ensureAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = await request.json();
    const parsedBody = createManualVipGrantSchema.safeParse(payload);

    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const grant = await adminVipService.createManualGrant({
      ...parsedBody.data,
      createdByUserId: session?.user?.id,
    });

    return NextResponse.json({ grant }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create VIP grant";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
