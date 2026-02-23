import prisma from "@/lib/prisma";
import type { GetUserCardInput, ToggleFanInput } from "@/types/user-card";

export const userCardRepository = {
  async getUserCardData({
    targetUserId,
    viewerUserId,
    deviceId,
  }: GetUserCardInput) {
    const prismaWithOptionalModels = prisma as typeof prisma & {
      postShare?: {
        count(args: { where: { userId: string } }): Promise<number>;
      };
      userFan?: {
        findUnique(args: {
          where: {
            targetUserId_deviceId: { targetUserId: string; deviceId: string };
          };
          select: { isActive: true };
        }): Promise<{ isActive: boolean } | null>;
        count(args: {
          where: { targetUserId: string; isActive: boolean };
        }): Promise<number>;
      };
    };

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    const isAdminProfile = user.role === "admin";
    const hasPostShareModel = Boolean(prismaWithOptionalModels.postShare);
    const hasUserFanModel = Boolean(prismaWithOptionalModels.userFan);

    const [
      commentsGiven,
      sharesGiven,
      likesGiven,
      lastComment,
      fanRecord,
      fansCount,
      activeBlock,
    ] = await Promise.all([
      prisma.comment.count({ where: { userId: targetUserId } }),
      hasPostShareModel
        ? prismaWithOptionalModels.postShare?.count({
            where: { userId: targetUserId },
          })
        : Promise.resolve(0),
      prisma.postLike.count({ where: { userId: targetUserId } }),
      prisma.comment.findFirst({
        where: { userId: targetUserId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      hasUserFanModel
        ? prismaWithOptionalModels.userFan?.findUnique({
            where: {
              targetUserId_deviceId: {
                targetUserId,
                deviceId,
              },
            },
            select: {
              isActive: true,
            },
          })
        : Promise.resolve(null),
      isAdminProfile && hasUserFanModel
        ? prismaWithOptionalModels.userFan?.count({
            where: {
              targetUserId,
              isActive: true,
            },
          })
        : Promise.resolve(0),
      prisma.userWriteBlock.findFirst({
        where: {
          targetUserId,
          isActive: true,
          startsAt: { lte: new Date() },
          OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: "desc" },
        select: {
          reason: true,
          endsAt: true,
        },
      }),
    ]);

    return {
      id: user.id,
      nickname: user.name || user.username || "Unknown user",
      avatarUrl: user.image,
      commentsGiven,
      sharesGiven,
      likesGiven,
      registeredAt: user.createdAt,
      lastCommentAt: lastComment?.createdAt ?? null,
      isAdminProfile,
      fansCount: isAdminProfile ? fansCount : null,
      isFan: isAdminProfile ? Boolean(fanRecord?.isActive) : false,
      isSelf: Boolean(viewerUserId && viewerUserId === targetUserId),
      isBlocked: Boolean(activeBlock),
      blockedUntil: activeBlock?.endsAt ?? null,
      blockedReason: activeBlock?.reason ?? null,
    };
  },

  async toggleFan({ targetUserId, viewerUserId, deviceId }: ToggleFanInput) {
    if (!prisma.userFan) {
      throw new Error(
        "UserFan model is not available in Prisma client. Run `npx prisma generate`.",
      );
    }

    return prisma.$transaction(async (tx) => {
      const targetUser = await tx.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, role: true },
      });

      if (!targetUser) {
        throw new Error("User not found");
      }

      if (targetUser.role !== "admin") {
        throw new Error("Fans are available only for admin profiles");
      }

      const existing = await tx.userFan.findUnique({
        where: {
          targetUserId_deviceId: {
            targetUserId,
            deviceId,
          },
        },
      });

      const nextIsFan = !(existing?.isActive ?? false);

      if (existing) {
        await tx.userFan.update({
          where: { id: existing.id },
          data: {
            isActive: nextIsFan,
            sourceUserId: viewerUserId ?? existing.sourceUserId,
            activatedAt: nextIsFan ? new Date() : existing.activatedAt,
            deactivatedAt: nextIsFan ? null : new Date(),
          },
        });
      } else {
        await tx.userFan.create({
          data: {
            targetUserId,
            sourceUserId: viewerUserId ?? null,
            deviceId,
            isActive: true,
          },
        });
      }

      const fansCount = await tx.userFan.count({
        where: {
          targetUserId,
          isActive: true,
        },
      });

      return {
        fansCount,
        isFan: nextIsFan,
      };
    });
  },
};
