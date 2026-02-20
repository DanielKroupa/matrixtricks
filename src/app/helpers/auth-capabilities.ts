import prisma from "@/lib/prisma";

export async function canUserChangePassword(userId: string) {
  const passwordAccount = await prisma.account.findFirst({
    where: {
      userId,
      password: {
        not: null,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(passwordAccount);
}
