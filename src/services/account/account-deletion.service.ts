import { verifyPassword } from "better-auth/crypto";
import { stripe } from "@/infrastructure/billing/stripe.client";
import { accountDeletionRepository } from "@/infrastructure/account/account-deletion.repository";

const FOURTEEN_DAYS_IN_MS = 14 * 24 * 60 * 60 * 1000;
const SOCIAL_DELETE_CONFIRMATION_TEXT = "SMAZAT";

type RequestDeletionInput = {
  userId: string;
  currentPassword?: string;
  confirmationText?: string;
};

type RestoreAfterReloginInput = {
  userId: string;
  sessionCreatedAt?: Date | null;
};

export class AccountDeletionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountDeletionValidationError";
  }
}

function computeDeleteAfterAt(from: Date) {
  return new Date(from.getTime() + FOURTEEN_DAYS_IN_MS);
}

export const accountDeletionService = {
  async requestDeletion(input: RequestDeletionInput) {
    const now = new Date();
    const lifecycle = await accountDeletionRepository.findLifecycleByUserId(
      input.userId,
    );

    if (!lifecycle) {
      throw new AccountDeletionValidationError("User not found");
    }

    if (lifecycle.pendingDeletionAt && lifecycle.deleteAfterAt) {
      if (lifecycle.deleteAfterAt > now) {
        return {
          deleteAfterAt: lifecycle.deleteAfterAt,
          alreadyScheduled: true,
        };
      }
    }

    const passwordHash =
      await accountDeletionRepository.findPasswordHashByUserId(input.userId);

    if (passwordHash) {
      if (!input.currentPassword) {
        throw new AccountDeletionValidationError(
          "Current password is required",
        );
      }

      const isValidPassword = await verifyPassword({
        hash: passwordHash,
        password: input.currentPassword,
      });

      if (!isValidPassword) {
        throw new AccountDeletionValidationError("Invalid current password");
      }
    } else {
      const normalizedConfirmationText =
        input.confirmationText?.trim().toUpperCase() ?? "";

      if (normalizedConfirmationText !== SOCIAL_DELETE_CONFIRMATION_TEXT) {
        throw new AccountDeletionValidationError(
          `Type ${SOCIAL_DELETE_CONFIRMATION_TEXT} to confirm account deletion`,
        );
      }
    }

    const stripeSubscriptionIds =
      await accountDeletionRepository.listActiveStripeSubscriptionIds(
        input.userId,
      );

    for (const stripeSubscriptionId of stripeSubscriptionIds) {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    }

    await accountDeletionRepository.markSubscriptionsCanceled(
      input.userId,
      now,
    );
    await accountDeletionRepository.revokeActiveManualVipGrants(
      input.userId,
      now,
    );

    const deleteAfterAt = computeDeleteAfterAt(now);

    await accountDeletionRepository.scheduleDeletion(
      input.userId,
      now,
      deleteAfterAt,
    );
    await accountDeletionRepository.deleteAllUserSessions(input.userId);

    return {
      deleteAfterAt,
      alreadyScheduled: false,
    };
  },

  async restoreAfterRelogin(input: RestoreAfterReloginInput) {
    const now = new Date();
    const lifecycle = await accountDeletionRepository.findLifecycleByUserId(
      input.userId,
    );

    if (!lifecycle?.pendingDeletionAt || !lifecycle.deleteAfterAt) {
      return { status: "none" as const };
    }

    if (lifecycle.deleteAfterAt <= now) {
      return { status: "expired" as const };
    }

    if (!input.sessionCreatedAt) {
      return { status: "blocked" as const };
    }

    if (input.sessionCreatedAt <= lifecycle.pendingDeletionAt) {
      return { status: "blocked" as const };
    }

    await accountDeletionRepository.clearDeletionSchedule(input.userId);
    return { status: "restored" as const };
  },

  async deleteExpiredAccounts() {
    const userIds = await accountDeletionRepository.findExpiredDeletionUserIds(
      new Date(),
    );

    return accountDeletionRepository.hardDeleteUsers(userIds);
  },

  getSocialConfirmationText() {
    return SOCIAL_DELETE_CONFIRMATION_TEXT;
  },
};
