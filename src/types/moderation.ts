export type WriteActionScope =
  | "COMMENT_CREATE"
  | "COMMENT_UPDATE"
  | "COMMENT_DELETE"
  | "FANWALL_CREATE"
  | "FANWALL_UPDATE"
  | "FANWALL_DELETE";

export type BlockWriteScopes = {
  commentCreate: boolean;
  commentUpdate: boolean;
  commentDelete: boolean;
  fanwallCreate: boolean;
  fanwallUpdate: boolean;
  fanwallDelete: boolean;
};

export type IdentityContext = {
  userId?: string | null;
  deviceId?: string | null;
  ipAddress?: string | null;
};

export type ActiveWriteBlock = {
  id: string;
  reason: string;
  endsAt: Date | null;
};
