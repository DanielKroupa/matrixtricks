import prisma from "@/lib/prisma";

const fanwallUserSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  role: true,
} as const;

const fanwallIncludeUser = {
  user: {
    select: fanwallUserSelect,
  },
} as const;

export const fanwallRepository = {
  async listLatest(limit: number) {
    return prisma.fanWallMessage.findMany({
      take: limit,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: fanwallIncludeUser,
    });
  },

  async listPinnedMessages() {
    return prisma.fanWallMessage.findMany({
      where: { isPinned: true },
      orderBy: { createdAt: "desc" },
      include: fanwallIncludeUser,
    });
  },

  async listNonPinnedBefore(beforeDate: Date, limit: number) {
    return prisma.fanWallMessage.findMany({
      where: { isPinned: false, createdAt: { lt: beforeDate } },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: fanwallIncludeUser,
    });
  },

  async createMessage(input: {
    body: string;
    title: string | null;
    nickname: string | null;
    contact: string | null;
    userId: string | null;
  }) {
    return prisma.fanWallMessage.create({
      data: {
        body: input.body,
        title: input.title,
        nickname: input.nickname,
        contact: input.contact,
        userId: input.userId,
      },
      include: fanwallIncludeUser,
    });
  },

  async findMessageById(id: string) {
    return prisma.fanWallMessage.findUnique({ where: { id } });
  },

  async updateMessage(
    id: string,
    data: {
      body?: string;
      title?: string | null;
      isPinned?: boolean;
    },
  ) {
    return prisma.fanWallMessage.update({
      where: { id },
      data,
      include: fanwallIncludeUser,
    });
  },

  async updateMessageWithExclusivePin(
    id: string,
    data: {
      body?: string;
      title?: string | null;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.fanWallMessage.updateMany({
        where: { isPinned: true },
        data: { isPinned: false },
      });

      return tx.fanWallMessage.update({
        where: { id },
        data: { ...data, isPinned: true },
        include: fanwallIncludeUser,
      });
    });
  },

  async deleteMessage(id: string) {
    await prisma.fanWallMessage.delete({ where: { id } });
  },
};
