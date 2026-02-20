import { userBlockRepository } from "@/infrastructure/moderation/user-block.repository";
import type {
  BlockWriteScopes,
  IdentityContext,
  WriteActionScope,
} from "@/domain/moderation/types";

export const userBlockService = {
  async recordIdentity(
    identity: IdentityContext & { source: "COMMENT" | "FANWALL" },
  ) {
    await userBlockRepository.recordIdentity(identity);
  },

  async assertCanWrite(identity: IdentityContext, action: WriteActionScope) {
    const activeBlock = await userBlockRepository.findActiveBlock(
      identity,
      action,
    );

    if (!activeBlock) {
      return;
    }

    const until = activeBlock.endsAt ? activeBlock.endsAt.toISOString() : null;
    throw new Error(
      until
        ? `You are blocked from writing until ${until}. Reason: ${activeBlock.reason}`
        : `You are blocked from writing permanently. Reason: ${activeBlock.reason}`,
    );
  },

  async getActiveWriteBlock(
    identity: IdentityContext,
    action: WriteActionScope,
  ) {
    return userBlockRepository.findActiveBlock(identity, action);
  },

  async blockUserByAdmin(input: {
    targetUserId: string;
    createdByUserId: string;
    reason: string;
    endsAt?: Date | null;
    scopes: BlockWriteScopes;
  }) {
    const latestIdentity = await userBlockRepository.getLatestIdentityByUserId(
      input.targetUserId,
    );

    return userBlockRepository.createBlock({
      ...input,
      targetDeviceId: latestIdentity?.deviceId ?? null,
      targetIp: latestIdentity?.ipAddress ?? null,
    });
  },

  async unblockUserByAdmin(targetUserId: string, revokedByUserId: string) {
    return userBlockRepository.revokeLatestActiveBlock(
      targetUserId,
      revokedByUserId,
    );
  },

  async getUserBlockStatus(targetUserId: string) {
    return userBlockRepository.getUserBlockStatus(targetUserId);
  },
};
