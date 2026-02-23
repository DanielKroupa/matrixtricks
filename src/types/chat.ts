export type ChatThreadStatus = "OPEN" | "ARCHIVED" | "BLOCKED";
export type ChatActorRole = "admin" | "user";
export type ChatStatus = "OPEN" | "ARCHIVED" | "BLOCKED";

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderUserId: string;
  senderUser: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    role: string | null;
  };
};

export type ChatThread = {
  id: string;
  status: "OPEN" | "ARCHIVED" | "BLOCKED";
  unreadForUser: number;
  unreadForAdmin: number;
};

export type UserChatWidgetProps = {
  userId: string | null;
  userRole?: string | null;
};

export type ThreadDetail = {
  thread: ThreadItem["thread"];
  messages: Array<{
    id: string;
    body: string;
    createdAt: string;
    senderUserId: string;
    senderUser: {
      id: string;
      name: string;
      role: string | null;
    };
  }>;
};

export type ThreadItem = {
  thread: {
    id: string;
    status: ChatStatus;
    unreadForUser: number;
    unreadForAdmin: number;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      username: string | null;
      image: string | null;
    };
  };
  lastMessage: {
    body: string;
    createdAt: string;
  } | null;
};

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
