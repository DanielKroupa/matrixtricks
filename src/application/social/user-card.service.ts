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

export const userCardService = {
  async getUserCard(input: CardInput): Promise<UserCardData | null> {
    const data = await userCardRepository.getUserCardData(input);
    if (!data) {
      return null;
    }

    return {
      ...data,
      registeredAt: data.registeredAt.toISOString(),
      lastCommentAt: data.lastCommentAt
        ? data.lastCommentAt.toISOString()
        : null,
    };
  },

  async toggleFan(input: CardInput): Promise<FanToggleResult> {
    return userCardRepository.toggleFan(input);
  },
};
