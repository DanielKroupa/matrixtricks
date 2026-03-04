import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { isAdminRole } from "@/lib/roles";
import { adminVipService } from "@/services/billing/admin-vip.service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const grant = await adminVipService.revokeGrant(id);

    return NextResponse.json({ grant });
  } catch (error) {
    console.error("Failed to revoke VIP grant", error);
    return NextResponse.json(
      { error: "Failed to revoke VIP grant" },
      { status: 400 },
    );
  }
}
