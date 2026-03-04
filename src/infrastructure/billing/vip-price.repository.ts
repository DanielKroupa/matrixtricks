import prisma from "@/lib/prisma";

export const vipPriceRepository = {
  async listAll() {
    return prisma.vipPrice.findMany({
      orderBy: [{ currency: "asc" }],
    });
  },

  async upsertMany(
    rows: Array<{
      currency: string;
      interval: "MONTHLY" | "SEMIANNUAL" | "YEARLY";
      priceId: string;
      isActive: boolean;
    }>,
  ) {
    await prisma.$transaction(
      rows.map((row) =>
        prisma.vipPrice.upsert({
          where: {
            currency_interval: {
              currency: row.currency,
              interval: row.interval,
            },
          },
          update: {
            priceId: row.priceId,
            isActive: row.isActive,
          },
          create: {
            currency: row.currency,
            interval: row.interval,
            priceId: row.priceId,
            isActive: row.isActive,
          },
        }),
      ),
    );

    return this.listAll();
  },

  async createAuditEvents(
    rows: Array<{
      currency: string;
      interval: "MONTHLY" | "SEMIANNUAL" | "YEARLY";
      previousPriceId: string | null;
      nextPriceId: string | null;
      previousIsActive: boolean | null;
      nextIsActive: boolean;
      changedByUserId?: string;
    }>,
  ) {
    if (rows.length === 0) {
      return;
    }

    await prisma.vipPriceAuditEvent.createMany({
      data: rows,
    });
  },

  async listRecentAuditEvents(limit = 50) {
    return prisma.vipPriceAuditEvent.findMany({
      take: limit,
      orderBy: [{ createdAt: "desc" }],
      include: {
        changedByUser: {
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
