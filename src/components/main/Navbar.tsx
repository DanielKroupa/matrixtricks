import NavbarClient from "./NavbarClient";
import { getServerSession } from "@/lib/get-session";
import type { User } from "@/lib/auth";
import { entitlementService } from "@/services/billing/entitlement.service";

export async function Navbar() {
  const session = await getServerSession();
  const user: User | null = session?.user || null;
  const vipStatus = await entitlementService.getUserVipStatus(user?.id);

  return (
    <NavbarClient
      initialSession={session}
      user={user ?? undefined}
      isVipActive={vipStatus.isVipActive}
    />
  );
}
