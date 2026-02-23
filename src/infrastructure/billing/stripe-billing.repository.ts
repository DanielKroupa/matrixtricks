import prisma from "@/lib/prisma";
import type { UpsertSubscriptionParams } from "@/types/billing";

export const stripeBillingRepository = {
  async findStripeCustomerByUserId(userId: string) {
    return prisma.stripeCustomer.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });
  },

  async createStripeCustomer(params: {
    userId: string;
    stripeCustomerId: string;
  }) {
    await prisma.stripeCustomer.create({
      data: {
        userId: params.userId,
        stripeCustomerId: params.stripeCustomerId,
      },
    });
  },

  async findStripeCustomerByStripeCustomerId(stripeCustomerId: string) {
    return prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId },
      select: { id: true, userId: true },
    });
  },

  async upsertSubscription(params: UpsertSubscriptionParams) {
    await prisma.subscription.upsert({
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
};
