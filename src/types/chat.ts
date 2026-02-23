export type ChatThreadStatus = "OPEN" | "ARCHIVED" | "BLOCKED";

export type ChatActorRole = "admin" | "user";

export type ChatThreadWithParticipants = {
  id: string;
  status: ChatThreadStatus;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
  archivedAt: Date | null;
  blockedAt: Date | null;
  unreadForUser: number;
  unreadForAdmin: number;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    email: string;
    image: string | null;
  };
};

export type ChatMessageWithSender = {
  id: string;
  body: string;
  createdAt: Date;
  threadId: string;
  senderUserId: string;
  senderUser: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    role: string | null;
  };
};

export type ChatThreadListItem = {
  thread: ChatThreadWithParticipants;
  lastMessage: ChatMessageWithSender | null;
};
