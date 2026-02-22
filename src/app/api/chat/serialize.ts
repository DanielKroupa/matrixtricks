export function serializeChatThread(thread: {
  id: string;
  status: string;
  userId: string;
  unreadForUser: number;
  unreadForAdmin: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
  archivedAt: Date | null;
  blockedAt: Date | null;
  user: {
    id: string;
    name: string;
    username: string | null;
    email: string;
    image: string | null;
  };
}) {
  return {
    ...thread,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    lastMessageAt: thread.lastMessageAt?.toISOString() ?? null,
    archivedAt: thread.archivedAt?.toISOString() ?? null,
    blockedAt: thread.blockedAt?.toISOString() ?? null,
  };
}

export function serializeChatMessage(message: {
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
}) {
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
  };
}
