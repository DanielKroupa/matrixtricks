import type { FanwallMessage } from "../../../types/fanwall";

export const PAGE_SIZE = 20;
export const DEFAULT_AVATAR = "/uploads/avatars/alien.png";

export function upsertMessage(
  prev: FanwallMessage[],
  message: FanwallMessage,
): FanwallMessage[] {
  const index = prev.findIndex((item) => item.id === message.id);

  if (index === -1) {
    return [...prev, message];
  }

  const next = [...prev];
  next[index] = message;

  return next;
}

export function removeMessageById(prev: FanwallMessage[], id: string) {
  return prev.filter((item) => item.id !== id);
}

export function getApiError(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }

  return fallback;
}

export function getAuthorName(message: FanwallMessage) {
  return (
    message.user?.name || message.user?.username || message.nickname || "Guest"
  );
}

export function getAvatarSrc(message: FanwallMessage) {
  return message.user?.image || DEFAULT_AVATAR;
}
