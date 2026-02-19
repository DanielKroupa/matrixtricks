import prisma from "@/lib/prisma";

const activeSubscriptionStatuses = ["ACTIVE", "TRIALING", "PAST_DUE"] as const;

export const entitlementRepository = {
  async findActiveSubscription(userId: string) {
    const now = new Date();

    return prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: [...activeSubscriptionStatuses],
        },
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gte: now } }],
      },
      orderBy: [{ currentPeriodEnd: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        currentPeriodEnd: true,
      },
    });
  },

  async findActiveManualGrant(userId: string) {
    const now = new Date();

    return prisma.vipGrant.findFirst({
      where: {
        userId,
        revokedAt: null,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      },
      orderBy: [{ endsAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        endsAt: true,
      },
    });
  },

  async findActiveSubscriptionUserIds(userIds: string[]) {
    if (userIds.length === 0) {
      return [];
    }

    const now = new Date();

    const rows = await prisma.subscription.findMany({
      where: {
        userId: { in: userIds },
        status: {
          in: [...activeSubscriptionStatuses],
        },
        OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gte: now } }],
      },
      select: {
        userId: true,
      },
    });

    return [...new Set(rows.map((row) => row.userId))];
  },

  async findActiveManualGrantUserIds(userIds: string[]) {
    if (userIds.length === 0) {
      return [];
    }

    const now = new Date();

    const rows = await prisma.vipGrant.findMany({
      where: {
        userId: { in: userIds },
        revokedAt: null,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gte: now } }],
      },
      select: {
        userId: true,
      },
    });

    return [...new Set(rows.map((row) => row.userId))];
  },

  async hasProcessedWebhookEvent(stripeEventId: string) {
    const found = await prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId },
      select: { id: true },
    });

    return Boolean(found);
  },

  async markWebhookEventProcessed(params: {
    stripeEventId: string;
    type: string;
    payload: unknown;
  }) {
    return prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: params.stripeEventId,
        type: params.type,
        payload: params.payload as any,
      },
    });
  },
};
