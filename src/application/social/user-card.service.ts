import type {
  FanToggleResult,
  UserCardData,
} from "@/domain/social/user-card.types";
import { userCardRepository } from "@/infrastructure/social/user-card.repository";

type CardInput = {
  targetUserId: string;
  viewerUserId?: string | null;
  deviceId: string;
};

function safeDateToIso(value: Date | string | null | undefined) {
  const date = value instanceof Date ? value : new Date(value ?? "");

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export const userCardService = {
  async getUserCard(input: CardInput): Promise<UserCardData | null> {
    const data = await userCardRepository.getUserCardData(input);
    if (!data) {
      return null;
    }

    return {
      ...data,
      registeredAt: safeDateToIso(data.registeredAt) ?? new Date().toISOString(),
      lastCommentAt: safeDateToIso(data.lastCommentAt),
    };
  },

  async toggleFan(input: CardInput): Promise<FanToggleResult> {
    return userCardRepository.toggleFan(input);
  },
};
