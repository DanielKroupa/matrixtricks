import { type NextRequest, NextResponse } from "next/server";
import { updateVipPricesSchema } from "@/lib/admin-monetization-schema";
import { getServerSession } from "@/lib/get-session";
import { isAdminRole } from "@/lib/roles";
import { vipPriceService } from "@/services/billing/vip-price.service";

function isAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  return Boolean(session?.user && isAdminRole(session.user.role));
}

export async function GET() {
  try {
    const session = await getServerSession();

    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [dbPrices, effectivePrices, auditEvents] = await Promise.all([
      vipPriceService.listDbPrices(),
      vipPriceService.listEffectivePrices(),
      vipPriceService.listRecentAuditEvents(40),
    ]);

    return NextResponse.json({
      dbPrices,
      effectivePrices,
      envPriceMap: vipPriceService.getEnvPriceMap(),
      auditEvents,
    });
  } catch (error) {
    console.error("Failed to fetch VIP prices", error);
    return NextResponse.json(
      { error: "Failed to fetch VIP prices" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = await request.json();
    const parsedPayload = updateVipPricesSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const dbPrices = await vipPriceService.saveDbPrices(
      parsedPayload.data.prices,
      session?.user?.id,
    );

    return NextResponse.json({ dbPrices }, { status: 200 });
  } catch (error) {
    console.error("Failed to update VIP prices", error);
    return NextResponse.json(
      { error: "Failed to update VIP prices" },
      { status: 500 },
    );
  }
}
