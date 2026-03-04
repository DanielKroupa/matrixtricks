import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import type { UpsertSubscriptionParams } from "@/types/billing";

type BillingDbClient = Prisma.TransactionClient | typeof prisma;

export const stripeBillingRepository = {
  async findStripeCustomerByUserId(
    userId: string,
    db: BillingDbClient = prisma,
  ) {
    return db.stripeCustomer.findUnique({
      where: { userId },
      select: { id: true, stripeCustomerId: true },
    });
  },

  async createStripeCustomer(params: {
    userId: string;
    stripeCustomerId: string;
  }) {
    return prisma.stripeCustomer.create({
      data: {
        userId: params.userId,
        stripeCustomerId: params.stripeCustomerId,
      },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    });
  },

  async findStripeCustomerByStripeCustomerId(
    stripeCustomerId: string,
    db: BillingDbClient = prisma,
  ) {
    return db.stripeCustomer.findUnique({
      where: { stripeCustomerId },
      select: { id: true, userId: true },
    });
  },

  async upsertSubscription(
    params: UpsertSubscriptionParams,
    db: BillingDbClient = prisma,
  ) {
    await db.subscription.upsert({
      where: {
        stripeSubscriptionId: params.stripeSubscriptionId,
      },
      update: {
        status: params.status,
        currentPeriodStart: params.currentPeriodStart,
        currentPeriodEnd: params.currentPeriodEnd,
        cancelAtPeriodEnd: params.cancelAtPeriodEnd,
        endedAt: params.endedAt,
        priceId: params.priceId,
        currency: params.currency,
      },
      create: {
        stripeSubscriptionId: params.stripeSubscriptionId,
        userId: params.userId,
        stripeCustomerId: params.stripeCustomerRecordId,
        status: params.status,
        currentPeriodStart: params.currentPeriodStart,
        currentPeriodEnd: params.currentPeriodEnd,
        cancelAtPeriodEnd: params.cancelAtPeriodEnd,
        endedAt: params.endedAt,
        priceId: params.priceId,
        currency: params.currency,
      },
    });
  },

  async createWebhookEvent(
    params: {
      stripeEventId: string;
      type: string;
      payload: unknown;
    },
    db: BillingDbClient = prisma,
  ) {
    await db.stripeWebhookEvent.create({
      data: {
        stripeEventId: params.stripeEventId,
        type: params.type,
        payload: params.payload as object,
      },
    });
  },
};
