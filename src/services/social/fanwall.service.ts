import { fanwallRepository } from "@/infrastructure/social/fanwall.repository";
import { entitlementService } from "@/services/billing/entitlement.service";

function safeToIso(value: Date | string | null | undefined) {
  const date = value instanceof Date ? value : new Date(value ?? "");

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

function serializeFanwallMessage(
  message: Awaited<ReturnType<typeof fanwallRepository.createMessage>>,
) {
  return {
    ...message,
    createdAt: safeToIso(message.createdAt),
    updatedAt: safeToIso(message.updatedAt),
  };
}

export const fanwallService = {
  async listMessages(params: { limit: number; before?: string | null }) {
    const beforeParam = params.before;

    if (beforeParam) {
      const beforeDate = new Date(beforeParam);
      if (Number.isNaN(beforeDate.getTime())) {
        const fallbackMessages = await fanwallRepository.listLatest(
          params.limit,
        );
        return fallbackMessages.map(serializeFanwallMessage);
      }

      const pinnedMessages = await fanwallRepository.listPinnedMessages();
      const nonPinnedMessages = await fanwallRepository.listNonPinnedBefore(
        beforeDate,
        params.limit,
      );

      return [...pinnedMessages, ...nonPinnedMessages].map(
        serializeFanwallMessage,
      );
    }

    const messages = await fanwallRepository.listLatest(params.limit);
    return messages.map(serializeFanwallMessage);
  },

  async createMessage(input: {
    body: string;
    title: string | null;
    nickname: string | null;
    contact: string | null;
    userId: string | null;
  }) {
    const created = await fanwallRepository.createMessage(input);
    return serializeFanwallMessage(created);
  },

  async getMessageById(id: string) {
    return fanwallRepository.findMessageById(id);
  },

  async updateMessage(
    id: string,
    input: {
      body?: string;
      title?: string | null;
      isPinned?: boolean;
    },
  ) {
    const updated =
      input.isPinned === true
        ? await fanwallRepository.updateMessageWithExclusivePin(id, {
            body: input.body,
            title: input.title,
          })
        : await fanwallRepository.updateMessage(id, {
            body: input.body,
            title: input.title,
            ...(input.isPinned !== undefined
              ? { isPinned: input.isPinned }
              : {}),
          });

    return serializeFanwallMessage(updated);
  },

  async deleteMessage(id: string) {
    await fanwallRepository.deleteMessage(id);
  },

  async getFanwallViewModel(
    sessionUser: {
      id: string;
      name?: string | null;
      username?: string | null;
      image?: string | null;
      role?: string | null;
    } | null,
  ) {
    const messages = await fanwallRepository.listLatest(50);

    const candidateUserIds = [
      ...(sessionUser?.id ? [sessionUser.id] : []),
      ...messages
        .map((message) => message.user?.id)
        .filter((id): id is string => Boolean(id)),
    ];

    const vipStatusMap =
      await entitlementService.getVipStatusMap(candidateUserIds);

    const serializedMessages = messages.map((message) => ({
      ...serializeFanwallMessage(message),
      user: message.user
        ? {
            ...message.user,
            isVipActive: vipStatusMap.get(message.user.id) ?? false,
          }
        : null,
    }));

    const mappedSessionUser = sessionUser
      ? {
          id: sessionUser.id,
          name: sessionUser.name ?? null,
          username: sessionUser.username ?? null,
          image: sessionUser.image ?? null,
          role: sessionUser.role ?? null,
          isVipActive: vipStatusMap.get(sessionUser.id) ?? false,
        }
      : null;

    return {
      initialMessages: serializedMessages,
      sessionUser: mappedSessionUser,
    };
  },
};
