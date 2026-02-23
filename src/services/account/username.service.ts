import { usernameRepository } from "@/infrastructure/account/username.repository";
import { normalizeUsernameIdentifier } from "@/lib/username-normalization";

export const RESERVED_NICKNAME_MESSAGE =
  "This nickname is already registered. Please choose another one.";

export class UsernameConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsernameConflictError";
  }
}

export class UsernameValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsernameValidationError";
  }
}

type UsernameCheckOptions = {
  excludeUserId?: string;
};

export const usernameService = {
  normalize(value: string) {
    return normalizeUsernameIdentifier(value);
  },

  async isRegisteredUsername(
    value: string,
    options: UsernameCheckOptions = {},
  ) {
    const normalizedValue = normalizeUsernameIdentifier(value);

    if (!normalizedValue) {
      return false;
    }

    return usernameRepository.existsByComparableUsername(
      normalizedValue,
      options.excludeUserId,
    );
  },

  async resolveLoginEmail(loginValue: string) {
    const normalizedValue = normalizeUsernameIdentifier(loginValue);

    if (!normalizedValue) {
      return null;
    }

    return usernameRepository.findEmailByComparableUsername(normalizedValue);
  },

  async updateNicknameForUser(userId: string, nickname: string) {
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      throw new UsernameValidationError("Nickname is required");
    }

    const isTaken = await this.isRegisteredUsername(trimmedNickname, {
      excludeUserId: userId,
    });

    if (isTaken) {
      throw new UsernameConflictError(RESERVED_NICKNAME_MESSAGE);
    }

    try {
      return await usernameRepository.updateUsernameFields(
        userId,
        trimmedNickname,
      );
    } catch (error) {
      const maybeCode =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: string }).code
          : undefined;

      if (maybeCode === "P2002") {
        throw new UsernameConflictError(RESERVED_NICKNAME_MESSAGE);
      }

      throw error;
    }
  },
};
