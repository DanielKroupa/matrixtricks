import prisma from "@/lib/prisma";
import type {
  ChatMessageWithSender,
  ChatThreadListItem,
  ChatThreadStatus,
  ChatThreadWithParticipants,
} from "@/types/chat";

const DEFAULT_THREAD_TAKE = 30;

const THREAD_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
    },
  },
} as const;

const MESSAGE_INCLUDE = {
  senderUser: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      role: true,
    },
  },
} as const;

function retentionFloorDate() {
  const floor = new Date();
  floor.setMonth(floor.getMonth() - 12);
  return floor;
}

export const chatRepository = {
  async getOrCreateThreadForUser(userId: string) {
    const existing = await prisma.chatThread.findUnique({
      where: { userId },
      include: THREAD_INCLUDE,
    });

    if (existing) {
      return existing as ChatThreadWithParticipants;
    }

    return prisma.chatThread.create({
      data: {
        userId,
      },
      include: THREAD_INCLUDE,
    }) as Promise<ChatThreadWithParticipants>;
  },

  async getThreadById(threadId: string) {
    return prisma.chatThread.findUnique({
      where: { id: threadId },
      include: THREAD_INCLUDE,
    }) as Promise<ChatThreadWithParticipants | null>;
  },

  async getThreadByUserId(userId: string) {
    return prisma.chatThread.findUnique({
      where: { userId },
      include: THREAD_INCLUDE,
    }) as Promise<ChatThreadWithParticipants | null>;
  },

  async listMessagesForThread(threadId: string, take = 100) {
    const floorDate = retentionFloorDate();

    const messages = await prisma.chatMessage.findMany({
      where: {
        threadId,
        createdAt: { gte: floorDate },
      },
      orderBy: { createdAt: "asc" },
      take,
      include: MESSAGE_INCLUDE,
    });

    return messages as ChatMessageWithSender[];
  },

  async listThreadsForAdmin(input: {
    status?: ChatThreadStatus;
    query?: string;
  }) {
    const threads = await prisma.chatThread.findMany({
      where: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.query
          ? {
              user: {
                OR: [
                  { name: { contains: input.query, mode: "insensitive" } },
                  { email: { contains: input.query, mode: "insensitive" } },
                  {
                    username: {
                      contains: input.query,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            }
          : {}),
      },
      include: {
        ...THREAD_INCLUDE,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: MESSAGE_INCLUDE,
        },
      },
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: DEFAULT_THREAD_TAKE,
    });

    return threads.map((thread) => ({
      thread: {
        ...thread,
        messages: undefined,
      },
      lastMessage: thread.messages[0] ?? null,
    })) as ChatThreadListItem[];
  },

  async createMessageForUser(input: { userId: string; body: string }) {
    return prisma.$transaction(async (tx) => {
      const thread = await tx.chatThread.upsert({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          status: "OPEN",
          unreadForAdmin: 1,
          unreadForUser: 0,
          lastMessageAt: new Date(),
        },
        update: {
          status: "OPEN",
          archivedAt: null,
          blockedAt: null,
          blockedByUserId: null,
          unreadForAdmin: { increment: 1 },
          lastMessageAt: new Date(),
        },
      });

      const message = await tx.chatMessage.create({
        data: {
          threadId: thread.id,
          senderUserId: input.userId,
          body: input.body,
        },
        include: MESSAGE_INCLUDE,
      });

      const updatedThread = await tx.chatThread.findUniqueOrThrow({
        where: { id: thread.id },
        include: THREAD_INCLUDE,
      });

      return {
        message: message as ChatMessageWithSender,
        thread: updatedThread as ChatThreadWithParticipants,
      };
    });
  },

  async createMessageForAdmin(input: {
    adminUserId: string;
    threadId: string;
    body: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const existingThread = await tx.chatThread.findUnique({
        where: { id: input.threadId },
      });

      if (!existingThread) {
        throw new Error("Thread not found");
      }

      const thread = await tx.chatThread.update({
        where: { id: input.threadId },
        data: {
          status: existingThread.status === "BLOCKED" ? "BLOCKED" : "OPEN",
          archivedAt: null,
          unreadForUser: { increment: 1 },
          lastMessageAt: new Date(),
        },
      });

      const message = await tx.chatMessage.create({
        data: {
          threadId: thread.id,
          senderUserId: input.adminUserId,
          body: input.body,
        },
        include: MESSAGE_INCLUDE,
      });

      const updatedThread = await tx.chatThread.findUniqueOrThrow({
        where: { id: thread.id },
        include: THREAD_INCLUDE,
      });

      return {
        message: message as ChatMessageWithSender,
        thread: updatedThread as ChatThreadWithParticipants,
      };
    });
  },

  async markReadForUser(userId: string) {
    const thread = await this.getOrCreateThreadForUser(userId);

    return prisma.chatThread.update({
      where: { id: thread.id },
      data: {
        unreadForUser: 0,
      },
      include: THREAD_INCLUDE,
    }) as Promise<ChatThreadWithParticipants>;
  },

  async markReadForAdmin(threadId: string) {
    return prisma.chatThread.update({
      where: { id: threadId },
      data: {
        unreadForAdmin: 0,
      },
      include: THREAD_INCLUDE,
    }) as Promise<ChatThreadWithParticipants>;
  },

  async setStatusByAdmin(input: {
    threadId: string;
    status: ChatThreadStatus;
    adminUserId: string;
  }) {
    const now = new Date();

    return prisma.chatThread.update({
      where: { id: input.threadId },
      data: {
        status: input.status,
        archivedAt: input.status === "ARCHIVED" ? now : null,
        blockedAt: input.status === "BLOCKED" ? now : null,
        blockedByUserId: input.status === "BLOCKED" ? input.adminUserId : null,
      },
      include: THREAD_INCLUDE,
    }) as Promise<ChatThreadWithParticipants>;
  },

  async countUserMessagesInRecentWindow(input: {
    userId: string;
    since: Date;
  }) {
    return prisma.chatMessage.count({
      where: {
        senderUserId: input.userId,
        createdAt: {
          gte: input.since,
        },
      },
    });
  },

  async getUnreadCountForUser(userId: string) {
    const thread = await prisma.chatThread.findUnique({
      where: { userId },
      select: { unreadForUser: true },
    });

    return thread?.unreadForUser ?? 0;
  },

  async deleteMessagesOlderThan(cutoff: Date) {
    const result = await prisma.chatMessage.deleteMany({
      where: {
        createdAt: {
          lt: cutoff,
        },
      },
    });

    return result.count;
  },
};
