import { headers } from "next/headers";
import { cache } from "react";
import { accountDeletionService } from "@/services/account/account-deletion.service";
import { auth } from "./auth";

export const getServerSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return null;
  }

  const sessionCreatedAt = session.session?.createdAt
    ? new Date(session.session.createdAt)
    : null;

  const restoreResult = await accountDeletionService.restoreAfterRelogin({
    userId: session.user.id,
    sessionCreatedAt,
  });

  if (
    restoreResult.status === "blocked" ||
    restoreResult.status === "expired"
  ) {
    return null;
  }

  return session;
});
