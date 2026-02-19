import prisma from "@/lib/prisma";

export const vipGrantRepository = {
  async findUserByIdOrEmail(params: { userId?: string; email?: string }) {
    if (params.userId) {
      return prisma.user.findUnique({
        where: { id: params.userId },
        select: { id: true, email: true, name: true, username: true },
      });
    }

    if (params.email) {
      return prisma.user.findUnique({
        where: { email: params.email },
        select: { id: true, email: true, name: true, username: true },
      });
    }

    return null;
  },

  async createGrant(params: {
    userId: string;
    createdByUserId?: string;
    endsAt?: Date | null;
    note?: string;
  }) {
    return prisma.vipGrant.create({
      data: {
        userId: params.userId,
        source: "MANUAL",
        startsAt: new Date(),
        endsAt: params.endsAt ?? null,
        note: params.note,
        createdByUserId: params.createdByUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });
  },

  async listRecentGrants(limit = 50) {
    return prisma.vipGrant.findMany({
      take: limit,
      orderBy: [{ createdAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });
  },

  async revokeGrant(grantId: string) {
    return prisma.vipGrant.update({
      where: { id: grantId },
      data: {
        revokedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });
  },
};
