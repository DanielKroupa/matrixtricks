export type FanwallUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  role: string | null;
  isVipActive?: boolean;
};

export type FanwallMessage = {
  id: string;
  body: string;
  title: string | null;
  nickname: string | null;
  contact: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  user: FanwallUser | null;
};

export type FanWallClientProps = {
  initialMessages: FanwallMessage[];
  sessionUser: FanwallUser | null;
  isAdmin: boolean;
};

export type FanwallError = string | null;

export type ApiResponse<T> = {
  message?: T;
  messages?: T[];
  error?: string;
};
