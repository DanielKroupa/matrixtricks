import { entitlementRepository } from "@/infrastructure/billing/entitlement.repository";
import type { VipAccessInput, VipStatus } from "@/types/billing";

function resolveAccess(input: VipAccessInput) {
  if (!input.vipOnly) {
    return true;
  }

  if (input.viewerRole === "admin") {
    return true;
  }

  if (input.viewerUserId && input.viewerUserId === input.authorId) {
    return true;
  }

  if (input.viewerHasVip) {
    return true;
  }

  return false;
}

export const entitlementService = {
  async getUserVipStatus(userId?: string | null): Promise<VipStatus> {
    if (!userId) {
      return {
        isVipActive: false,
        source: null,
        expiresAt: null,
      };
    }

    const [activeManualGrant, activeSubscription] = await Promise.all([
      entitlementRepository.findActiveManualGrant(userId),
      entitlementRepository.findActiveSubscription(userId),
    ]);

    if (activeManualGrant) {
      return {
        isVipActive: true,
        source: "manual",
        expiresAt: activeManualGrant.endsAt,
      };
    }

    if (activeSubscription) {
      return {
        isVipActive: true,
        source: "stripe",
        expiresAt: activeSubscription.currentPeriodEnd,
      };
    }

    return {
      isVipActive: false,
      source: null,
      expiresAt: null,
    };
  },

  canAccessVipContent(input: VipAccessInput) {
    return resolveAccess(input);
  },

  async getVipStatusMap(userIds: string[]) {
    const normalizedUserIds = [...new Set(userIds.filter(Boolean))];

    if (normalizedUserIds.length === 0) {
      return new Map<string, boolean>();
    }

    const [manualGrantUserIds, subscriptionUserIds] = await Promise.all([
      entitlementRepository.findActiveManualGrantUserIds(normalizedUserIds),
      entitlementRepository.findActiveSubscriptionUserIds(normalizedUserIds),
    ]);

    const vipSet = new Set<string>([
      ...manualGrantUserIds,
      ...subscriptionUserIds,
    ]);

    const statusMap = new Map<string, boolean>();
    for (const userId of normalizedUserIds) {
      statusMap.set(userId, vipSet.has(userId));
    }

    return statusMap;
  },
};
