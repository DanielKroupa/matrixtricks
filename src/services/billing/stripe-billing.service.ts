import type Stripe from "stripe";
import { entitlementRepository } from "@/infrastructure/billing/entitlement.repository";
import { stripe } from "@/infrastructure/billing/stripe.client";
import { stripeBillingRepository } from "@/infrastructure/billing/stripe-billing.repository";
import { vipPriceService } from "@/services/billing/vip-price.service";

type PrismaSubscriptionStatus =
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "PAUSED";

function resolveSuccessUrl(origin: string) {
  return `${origin}/settings?vip=success`;
}

function resolveCancelUrl(origin: string) {
  return `${origin}/settings?vip=cancelled`;
}

function toPrismaSubscriptionStatus(
  status: Stripe.Subscription.Status,
): PrismaSubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "unpaid":
      return "UNPAID";
    case "paused":
      return "PAUSED";
    case "incomplete_expired":
      return "INCOMPLETE_EXPIRED";
    default:
      return "INCOMPLETE";
  }
}

function toSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];

  const currentPeriodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000)
    : null;

  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null;

  return {
    currentPeriodStart,
    currentPeriodEnd,
  };
}

export const stripeBillingService = {
  async createCheckoutSession(params: {
    userId: string;
    userEmail: string;
    origin: string;
    currency: string;
  }) {
    const priceId = await vipPriceService.getEffectivePriceIdByCurrency(
      params.currency,
    );

    const existingCustomer =
      await stripeBillingRepository.findStripeCustomerByUserId(params.userId);

    let stripeCustomerId = existingCustomer?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: params.userEmail,
        metadata: {
          userId: params.userId,
        },
      });

      stripeCustomerId = customer.id;

      await stripeBillingRepository.createStripeCustomer({
        userId: params.userId,
        stripeCustomerId,
      });
    }

    return stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: resolveSuccessUrl(params.origin),
      cancel_url: resolveCancelUrl(params.origin),
      metadata: {
        userId: params.userId,
      },
      allow_promotion_codes: true,
    });
  },

  async handleWebhookEvent(payload: string, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    const alreadyProcessed =
      await entitlementRepository.hasProcessedWebhookEvent(event.id);

    if (alreadyProcessed) {
      return { processed: false as const, reason: "duplicate" as const };
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const stripeCustomer =
        await stripeBillingRepository.findStripeCustomerByStripeCustomerId(
          stripeCustomerId,
        );

      if (stripeCustomer) {
        const status = toPrismaSubscriptionStatus(subscription.status);
        const { currentPeriodStart, currentPeriodEnd } =
          toSubscriptionPeriod(subscription);

        await stripeBillingRepository.upsertSubscription({
          stripeSubscriptionId: subscription.id,
          userId: stripeCustomer.userId,
          stripeCustomerRecordId: stripeCustomer.id,
          status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
          endedAt: subscription.ended_at
            ? new Date(subscription.ended_at * 1000)
            : null,
          priceId: subscription.items?.data?.[0]?.price?.id ?? null,
          currency: subscription.currency?.toUpperCase() ?? null,
        });
      }
    }

    await entitlementRepository.markWebhookEventProcessed({
      stripeEventId: event.id,
      type: event.type,
      payload: event,
    });

    return { processed: true as const };
  },
};
