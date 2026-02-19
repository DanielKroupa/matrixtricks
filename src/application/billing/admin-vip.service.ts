import { vipGrantRepository } from "@/infrastructure/billing/vip-grant.repository";

export const adminVipService = {
  async createManualGrant(params: {
    userId?: string;
    userEmail?: string;
    createdByUserId?: string;
    endsAt?: string;
    note?: string;
  }) {
    const user = await vipGrantRepository.findUserByIdOrEmail({
      userId: params.userId,
      email: params.userEmail,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const endsAt = params.endsAt ? new Date(params.endsAt) : null;

    if (endsAt && Number.isNaN(endsAt.getTime())) {
      throw new Error("Invalid endsAt date");
    }

    return vipGrantRepository.createGrant({
      userId: user.id,
      createdByUserId: params.createdByUserId,
      endsAt,
      note: params.note,
    });
  },

  async listRecentGrants(limit = 50) {
    return vipGrantRepository.listRecentGrants(limit);
  },

  async revokeGrant(grantId: string) {
    return vipGrantRepository.revokeGrant(grantId);
  },
};
