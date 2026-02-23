import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import { onlineVisibilitySchema } from "@/lib/schemas/userSchema/online-visibility-schema";

export async function getCurrentUserOnlineVisibility() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return { enabled: true };
  }

  const rows = await prisma.$queryRaw<Array<{ onlineVisibility: boolean }>>`
    SELECT "onlineVisibility"
    FROM "user"
    WHERE "id" = ${userId}
    LIMIT 1
  `;

  return { enabled: rows[0]?.onlineVisibility ?? true };
}

export async function saveCurrentUserOnlineVisibility(input: {
  enabled: boolean;
}) {
  const session = await getServerSession();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const result = onlineVisibilitySchema.safeParse(input);

  if (!result.success) {
    return {
      error:
        result.error.issues[0]?.message || "Invalid online visibility value",
    };
  }

  await prisma.$executeRaw`
    UPDATE "user"
    SET "onlineVisibility" = ${result.data.enabled}, "updatedAt" = NOW()
    WHERE "id" = ${userId}
  `;

  return { success: true, enabled: result.data.enabled };
}
