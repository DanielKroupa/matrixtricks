export type VipStatus = {
  isVipActive: boolean;
  source: "stripe" | "manual" | null;
  expiresAt: Date | null;
};

export type VipAccessInput = {
  vipOnly: boolean;
  authorId: string;
  viewerUserId?: string;
  viewerRole?: string | null;
  viewerHasVip: boolean;
};
