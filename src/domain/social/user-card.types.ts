export type UserCardData = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  commentsGiven: number;
  sharesGiven: number;
  likesGiven: number;
  registeredAt: string;
  lastCommentAt: string | null;
  isAdminProfile: boolean;
  fansCount: number | null;
  isFan: boolean;
  isSelf: boolean;
  viewerIsAdmin: boolean;
  isBlocked: boolean;
  blockedUntil: string | null;
  blockedReason: string | null;
};

export type FanToggleResult = {
  fansCount: number;
  isFan: boolean;
};
