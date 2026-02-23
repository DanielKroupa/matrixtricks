import { chatRepository } from "@/infrastructure/chat/chat.repository";
import { ChatAdminReplyEmailTemplate } from "@/lib/chat-email-template";
import { broadcastChatEvent } from "@/lib/chat-realtime";
import { FROM_EMAIL, resend } from "@/lib/resend";
import type { ChatThreadStatus } from "@/types/chat";

const USER_RATE_LIMIT_MAX_MESSAGES = 5;
const USER_RATE_LIMIT_WINDOW_MS = 10_000;

export const chatService = {
  async getOrCreateUserThreadWithMessages(userId: string) {
    const thread = await chatRepository.getOrCreateThreadForUser(userId);
    const messages = await chatRepository.listMessagesForThread(thread.id);

    return { thread, messages };
  },

  async sendMessageAsUser(input: { userId: string; body: string }) {
    const now = new Date();
    const since = new Date(now.getTime() - USER_RATE_LIMIT_WINDOW_MS);
    const sentInWindow = await chatRepository.countUserMessagesInRecentWindow({
      userId: input.userId,
      since,
    });

    if (sentInWindow >= USER_RATE_LIMIT_MAX_MESSAGES) {
      throw new Error("Rate limit exceeded. Try again in a few seconds.");
    }

    const existingThread = await chatRepository.getThreadByUserId(input.userId);
    if (existingThread?.status === "BLOCKED") {
      throw new Error("You are blocked from sending chat messages.");
    }

    const result = await chatRepository.createMessageForUser({
      userId: input.userId,
      body: input.body,
    });

    await this.emitThreadUpdated(result.thread);

    return result;
  },

  async sendMessageAsAdmin(input: {
    adminUserId: string;
    threadId: string;
    body: string;
  }) {
    const result = await chatRepository.createMessageForAdmin(input);

    await this.emitThreadUpdated(result.thread);

    await this.notifyUserAboutAdminReply(result.thread.user.email, {
      name: result.thread.user.name,
    });

    return result;
  },

  async markReadAsUser(userId: string) {
    return chatRepository.markReadForUser(userId);
  },

  async markReadAsAdmin(threadId: string) {
    return chatRepository.markReadForAdmin(threadId);
  },

  async getUserUnreadCount(userId: string) {
    return chatRepository.getUnreadCountForUser(userId);
  },

  async listThreadsForAdmin(input: {
    status?: ChatThreadStatus;
    query?: string;
  }) {
    return chatRepository.listThreadsForAdmin(input);
  },

  async getOrCreateThreadForAdminByUserId(userId: string) {
    return chatRepository.getOrCreateThreadForUser(userId);
  },

  async getThreadMessagesForAdmin(threadId: string) {
    const thread = await chatRepository.getThreadById(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    const messages = await chatRepository.listMessagesForThread(thread.id);

    return { thread, messages };
  },

  async setStatusByAdmin(input: {
    adminUserId: string;
    threadId: string;
    status: ChatThreadStatus;
  }) {
    const thread = await chatRepository.setStatusByAdmin(input);
    await this.emitThreadUpdated(thread);
    return thread;
  },

  async cleanupExpiredMessages() {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 12);

    return chatRepository.deleteMessagesOlderThan(cutoff);
  },

  async emitThreadUpdated(thread: {
    id: string;
    userId: string;
    status: ChatThreadStatus;
    unreadForUser: number;
    unreadForAdmin: number;
  }) {
    await broadcastChatEvent("chat:thread-updated", {
      threadId: thread.id,
      userId: thread.userId,
      status: thread.status,
      unreadForUser: thread.unreadForUser,
      unreadForAdmin: thread.unreadForAdmin,
    });
  },

  async notifyUserAboutAdminReply(
    recipientEmail: string,
    input: { name: string },
  ) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: recipientEmail,
        subject: "Nová odpověď od admina",
        html: ChatAdminReplyEmailTemplate({ recipientName: input.name }),
      });
    } catch {
      // Ignore email failures to keep chat delivery resilient.
    }
  },
};
