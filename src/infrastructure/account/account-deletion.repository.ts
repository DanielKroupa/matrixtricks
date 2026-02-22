import prisma from "@/lib/prisma";

const activeSubscriptionStatuses = ["ACTIVE", "TRIALING", "PAST_DUE"] as const;

export const accountDeletionRepository = {
  async findLifecycleByUserId(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        pendingDeletionAt: true,
        deleteAfterAt: true,
      },
    });
  },

  async findPasswordHashByUserId(userId: string) {
    const passwordAccount = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "credential",
        password: {
          not: null,
        },
      },
      select: {
        password: true,
      },
    });

    return passwordAccount?.password ?? null;
  },

  async revokeActiveManualVipGrants(userId: string, revokedAt: Date) {
    await prisma.vipGrant.updateMany({
      where: {
        userId,
        revokedAt: null,
        startsAt: {
          lte: revokedAt,
        },
        OR: [{ endsAt: null }, { endsAt: { gte: revokedAt } }],
      },
      data: {
        revokedAt,
      },
    });
  },

  async listActiveStripeSubscriptionIds(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        status: {
          in: [...activeSubscriptionStatuses],
        },
      },
      select: {
        stripeSubscriptionId: true,
      },
    });

    return subscriptions
      .map((subscription) => subscription.stripeSubscriptionId)
      .filter(Boolean);
  },

  async markSubscriptionsCanceled(userId: string, endedAt: Date) {
    await prisma.subscription.updateMany({
      where: {
        userId,
        status: {
          in: [...activeSubscriptionStatuses],
        },
      },
      data: {
        status: "CANCELED",
        cancelAtPeriodEnd: false,
        endedAt,
      },
    });
  },

  async scheduleDeletion(
    userId: string,
    pendingDeletionAt: Date,
    deleteAfterAt: Date,
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingDeletionAt,
        deleteAfterAt,
      },
    });
  },

  async clearDeletionSchedule(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingDeletionAt: null,
        deleteAfterAt: null,
      },
    });
  },

  async deleteAllUserSessions(userId: string) {
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  },

  async findExpiredDeletionUserIds(now: Date) {
    const users = await prisma.user.findMany({
      where: {
        pendingDeletionAt: {
          not: null,
        },
        deleteAfterAt: {
          lte: now,
        },
      },
      select: {
        id: true,
      },
    });

    return users.map((user) => user.id);
  },

  async hardDeleteUsers(userIds: string[]) {
    if (userIds.length === 0) {
      return 0;
    }

    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return result.count;
  },
};
