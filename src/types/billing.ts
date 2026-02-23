export type VipStatus = {
  isVipActive: boolean;
  source: "stripe" | "manual" | null;
  expiresAt: Date | null;
};

export type VipAccessInput = {
  vipOnly: boolean;
  authorId: string;
  viewerUserId?: string;
  viewerRole?: string | null;
  viewerHasVip: boolean;
};

export type UpsertSubscriptionParams = {
  stripeSubscriptionId: string;
  userId: string;
  stripeCustomerRecordId: string;
  status:
    | "INCOMPLETE"
    | "INCOMPLETE_EXPIRED"
    | "TRIALING"
    | "ACTIVE"
    | "PAST_DUE"
    | "CANCELED"
    | "UNPAID"
    | "PAUSED";
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  endedAt: Date | null;
  priceId: string | null;
  currency: string | null;
};
