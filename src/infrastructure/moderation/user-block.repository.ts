import prisma from "@/lib/prisma";
import type {
  ActiveWriteBlock,
  BlockWriteScopes,
  IdentityContext,
  WriteActionScope,
} from "@/domain/moderation/types";

function toScopeFilter(action: WriteActionScope) {
  switch (action) {
    case "COMMENT_CREATE":
      return { scopeCommentCreate: true };
    case "COMMENT_UPDATE":
      return { scopeCommentUpdate: true };
    case "COMMENT_DELETE":
      return { scopeCommentDelete: true };
    case "FANWALL_CREATE":
      return { scopeFanwallCreate: true };
    case "FANWALL_UPDATE":
      return { scopeFanwallUpdate: true };
    case "FANWALL_DELETE":
      return { scopeFanwallDelete: true };
    default:
      return { scopeCommentCreate: true };
  }
}

export const userBlockRepository = {
  async recordIdentity({
    userId,
    deviceId,
    ipAddress,
    source,
  }: IdentityContext & { source: "COMMENT" | "FANWALL" }) {
    await prisma.userIdentityLog.create({
      data: {
        userId: userId ?? null,
        deviceId: deviceId ?? null,
        ipAddress: ipAddress ?? null,
        source,
      },
    });
  },

  async findActiveBlock(identity: IdentityContext, action: WriteActionScope) {
    const now = new Date();
    const scopeFilter = toScopeFilter(action);

    const orFilters = [] as Array<Record<string, unknown>>;

    if (identity.userId) {
      orFilters.push({ targetUserId: identity.userId });
    }

    if (identity.deviceId) {
      orFilters.push({ targetDeviceId: identity.deviceId });
    }

    if (identity.ipAddress) {
      orFilters.push({ targetIp: identity.ipAddress });
    }

    if (orFilters.length === 0) {
      return null;
    }

    return prisma.userWriteBlock.findFirst({
      where: {
        isActive: true,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        AND: [
          {
            OR: orFilters,
          },
          scopeFilter,
        ],
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        reason: true,
        endsAt: true,
      },
    }) as Promise<ActiveWriteBlock | null>;
  },

  async createBlock(input: {
    targetUserId: string;
    createdByUserId: string;
    reason: string;
    endsAt?: Date | null;
    scopes: BlockWriteScopes;
    targetDeviceId?: string | null;
    targetIp?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const block = await tx.userWriteBlock.create({
        data: {
          targetUserId: input.targetUserId,
          createdByUserId: input.createdByUserId,
          reason: input.reason,
          endsAt: input.endsAt ?? null,
          scopeCommentCreate: input.scopes.commentCreate,
          scopeCommentUpdate: input.scopes.commentUpdate,
          scopeCommentDelete: input.scopes.commentDelete,
          scopeFanwallCreate: input.scopes.fanwallCreate,
          scopeFanwallUpdate: input.scopes.fanwallUpdate,
          scopeFanwallDelete: input.scopes.fanwallDelete,
          targetDeviceId: input.targetDeviceId ?? null,
          targetIp: input.targetIp ?? null,
        },
      });

      await tx.userBlockAuditEvent.create({
        data: {
          eventType: "BLOCK_CREATED",
          reason: input.reason,
          blockId: block.id,
          performedByUserId: input.createdByUserId,
          targetUserId: input.targetUserId,
          targetDeviceId: input.targetDeviceId ?? null,
          targetIp: input.targetIp ?? null,
          details: {
            endsAt: input.endsAt ?? null,
            scopes: input.scopes,
          },
        },
      });

      return block;
    });
  },

  async revokeLatestActiveBlock(targetUserId: string, revokedByUserId: string) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const active = await tx.userWriteBlock.findFirst({
        where: {
          targetUserId,
          isActive: true,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
        orderBy: [{ createdAt: "desc" }],
      });

      if (!active) {
        return null;
      }

      const updated = await tx.userWriteBlock.update({
        where: { id: active.id },
        data: {
          isActive: false,
          revokedAt: now,
          revokedByUserId,
        },
      });

      await tx.userBlockAuditEvent.create({
        data: {
          eventType: "BLOCK_REVOKED",
          reason: active.reason,
          blockId: active.id,
          performedByUserId: revokedByUserId,
          targetUserId: active.targetUserId,
          targetDeviceId: active.targetDeviceId,
          targetIp: active.targetIp,
          details: {
            revokedAt: now,
          },
        },
      });

      return updated;
    });
  },

  async getLatestIdentityByUserId(userId: string) {
    return prisma.userIdentityLog.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        deviceId: true,
        ipAddress: true,
      },
    });
  },

  async getUserBlockStatus(targetUserId: string) {
    const now = new Date();

    return prisma.userWriteBlock.findFirst({
      where: {
        targetUserId,
        isActive: true,
        startsAt: { lte: now },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        reason: true,
        endsAt: true,
      },
    });
  },
};
