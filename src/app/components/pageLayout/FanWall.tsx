import { fanwallService } from "@/application/social/fanwall.service";
import FanWallClient from "@/components/main/FanWallClient";
import { getServerSession } from "@/lib/get-session";

export async function FanWall() {
  const session = await getServerSession();
  const user = session?.user ?? null;
  const isAdmin = user?.role === "admin";
  const { initialMessages, sessionUser } =
    await fanwallService.getFanwallViewModel(user);

  return (
    <FanWallClient
      initialMessages={initialMessages}
      sessionUser={sessionUser}
      isAdmin={isAdmin}
    />
  );
}
