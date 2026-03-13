import type Stripe from "stripe";
import type { Prisma } from "@/generated/prisma/client";
import { stripe } from "@/infrastructure/billing/stripe.client";
import { stripeBillingRepository } from "@/infrastructure/billing/stripe-billing.repository";
import prisma from "@/lib/prisma";
import { vipPriceService } from "@/services/billing/vip-price.service";
import type { VipBillingInterval } from "@/types/billing";

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

function createCheckoutIdempotencyKey(params: {
  userId: string;
  interval: VipBillingInterval;
  currency: string;
}) {
  const minuteBucket = Math.floor(Date.now() / 60_000);
  return `vip-checkout:${params.userId}:${params.interval}:${params.currency}:${minuteBucket}`;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
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

function toStripeCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
) {
  if (typeof customer === "string") {
    return customer;
  }

  return customer.id;
}

function toStripeSubscriptionId(
  subscription: string | Stripe.Subscription | null | undefined,
) {
  if (typeof subscription === "string") {
    return subscription;
  }

  return subscription?.id ?? null;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  if (invoice.parent?.type === "subscription_details") {
    return toStripeSubscriptionId(
      invoice.parent.subscription_details?.subscription,
    );
  }

  const legacyInvoice = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };

  return toStripeSubscriptionId(legacyInvoice.subscription);
}

function getChargeInvoiceId(charge: Stripe.Charge) {
  const legacyCharge = charge as Stripe.Charge & {
    invoice?: string | null;
  };

  return typeof legacyCharge.invoice === "string" ? legacyCharge.invoice : null;
}

async function upsertSubscriptionFromStripeObject(
  subscription: Stripe.Subscription,
  tx: Prisma.TransactionClient,
  options?: {
    forceCanceledNow?: boolean;
  },
) {
  const stripeCustomerId = toStripeCustomerId(subscription.customer);
  const stripeCustomer =
    await stripeBillingRepository.findStripeCustomerByStripeCustomerId(
      stripeCustomerId,
      tx,
    );

  if (!stripeCustomer) {
    return;
  }

  const status = options?.forceCanceledNow
    ? "CANCELED"
    : toPrismaSubscriptionStatus(subscription.status);
  const { currentPeriodStart, currentPeriodEnd } =
    toSubscriptionPeriod(subscription);
  const now = new Date();

  await stripeBillingRepository.upsertSubscription(
    {
      stripeSubscriptionId: subscription.id,
      userId: stripeCustomer.userId,
      stripeCustomerRecordId: stripeCustomer.id,
      status,
      currentPeriodStart,
      currentPeriodEnd: options?.forceCanceledNow ? now : currentPeriodEnd,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
      endedAt: options?.forceCanceledNow
        ? now
        : subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : null,
      priceId: subscription.items?.data?.[0]?.price?.id ?? null,
      currency: subscription.currency?.toUpperCase() ?? null,
    },
    tx,
  );
}

export const stripeBillingService = {
  async createCheckoutSession(params: {
    userId: string;
    userEmail: string;
    origin: string;
    currency: string;
    interval: VipBillingInterval;
  }) {
    const normalizedCurrency = params.currency.toUpperCase();
    const priceId = await vipPriceService.getEffectivePriceId({
      currency: normalizedCurrency,
      interval: params.interval,
    });

    let existingCustomer =
      await stripeBillingRepository.findStripeCustomerByUserId(params.userId);

    let stripeCustomerId = existingCustomer?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create(
        {
          email: params.userEmail,
          metadata: {
            userId: params.userId,
          },
        },
        {
          idempotencyKey: `vip-customer:${params.userId}`,
        },
      );

      stripeCustomerId = customer.id;

      try {
        existingCustomer = await stripeBillingRepository.createStripeCustomer({
          userId: params.userId,
          stripeCustomerId,
        });
      } catch (error) {
        if (!isUniqueConstraintError(error)) {
          throw error;
        }

        existingCustomer =
          await stripeBillingRepository.findStripeCustomerByUserId(
            params.userId,
          );

        stripeCustomerId = existingCustomer?.stripeCustomerId;
      }

      if (!stripeCustomerId) {
        throw new Error("Failed to resolve Stripe customer for checkout");
      }
    }

    return stripe.checkout.sessions.create(
      {
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
        automatic_tax: {
          enabled: true,
        },
        metadata: {
          userId: params.userId,
          vipCurrency: normalizedCurrency,
          vipInterval: params.interval,
        },
        allow_promotion_codes: true,
      },
      {
        idempotencyKey: createCheckoutIdempotencyKey({
          userId: params.userId,
          interval: params.interval,
          currency: normalizedCurrency,
        }),
      },
    );
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

    const upserts: Array<{
      subscription: Stripe.Subscription;
      forceCanceledNow?: boolean;
    }> = [];
    const customerLinks: Array<{ userId: string; stripeCustomerId: string }> =
      [];

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      upserts.push({
        subscription: event.data.object as Stripe.Subscription,
      });
    }

    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;
      const stripeCustomerId =
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : null;

      if (userId && stripeCustomerId) {
        customerLinks.push({ userId, stripeCustomerId });
      }
    }

    if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getInvoiceSubscriptionId(invoice);

      if (subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        upserts.push({ subscription });
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const isFullRefund = charge.amount_refunded >= charge.amount;
      const invoiceId = getChargeInvoiceId(charge);

      if (isFullRefund && invoiceId) {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          upserts.push({ subscription, forceCanceledNow: true });
        }
      }
    }

    try {
      await prisma.$transaction(async (tx) => {
        await stripeBillingRepository.createWebhookEvent(
          {
            stripeEventId: event.id,
            type: event.type,
            payload: event,
          },
          tx,
        );

        for (const link of customerLinks) {
          const existingCustomer =
            await stripeBillingRepository.findStripeCustomerByUserId(
              link.userId,
              tx,
            );

          if (!existingCustomer) {
            await stripeBillingRepository.createStripeCustomer({
              userId: link.userId,
              stripeCustomerId: link.stripeCustomerId,
            });
          }
        }

        for (const upsert of upserts) {
          await upsertSubscriptionFromStripeObject(
            upsert.subscription,
            tx,
            upsert.forceCanceledNow ? { forceCanceledNow: true } : undefined,
          );
        }
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        return { processed: false as const, reason: "duplicate" as const };
      }

      throw error;
    }

    return { processed: true as const };
  },
};
