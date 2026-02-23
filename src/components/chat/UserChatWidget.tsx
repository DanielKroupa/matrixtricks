"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { X } from "lucide-react";

type ChatMessage = {
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

type ChatThread = {
  id: string;
  status: "OPEN" | "ARCHIVED" | "BLOCKED";
  unreadForUser: number;
  unreadForAdmin: number;
};

type UserChatWidgetProps = {
  userId: string | null;
  userRole?: string | null;
};

export default function UserChatWidget({
  userId,
  userRole,
}: UserChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const isBlocked = thread?.status === "BLOCKED";
  const canRender = Boolean(userId) && userRole !== "admin";

  const loadUnread = useCallback(async () => {
    const res = await fetch("/api/chat/unread", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setUnreadCount(data.unreadCount ?? 0);
  }, []);

  const loadThread = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat/thread", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to load chat");
        return;
      }

      setThread(data.thread);
      setMessages(data.messages ?? []);

      if ((data.thread?.unreadForUser ?? 0) > 0) {
        const markReadRes = await fetch("/api/chat/thread/read", {
          method: "POST",
        });

        if (markReadRes.ok) {
          const readData = await markReadRes.json();
          setThread(readData.thread);
          setUnreadCount(0);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canRender) {
      return;
    }

    void loadUnread();
  }, [canRender, loadUnread]);

  useEffect(() => {
    if (!canRender) {
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_FANWALL_SOCKET_URL || "http://localhost:3001";

    const socket: Socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on(
      "chat:thread-updated",
      (payload: { userId?: string; unreadForUser?: number }) => {
        if (!payload?.userId || payload.userId !== userId) {
          return;
        }

        if (typeof payload.unreadForUser === "number") {
          setUnreadCount(payload.unreadForUser);
        }

        if (isOpen) {
          void loadThread();
        }
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [canRender, isOpen, loadThread, loadUnread, userId]);

  useEffect(() => {
    if (!canRender) {
      return;
    }

    const handleOpenChat = () => {
      setIsOpen(true);
      void loadThread();
    };

    window.addEventListener("matrix:open-chat-widget", handleOpenChat);

    return () => {
      window.removeEventListener("matrix:open-chat-widget", handleOpenChat);
    };
  }, [canRender, loadThread]);

  const toggleOpen = async () => {
    const next = !isOpen;
    setIsOpen(next);

    if (next) {
      await loadThread();
    }
  };

  const sendMessage = async () => {
    const trimmedBody = body.trim();
    if (!trimmedBody || sending || isBlocked) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat/thread/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: trimmedBody }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send message");
        return;
      }

      setThread(data.thread);
      setMessages((prev) => [...prev, data.message]);
      setBody("");
    } finally {
      setSending(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (thread?.status === "BLOCKED") {
      return "Chat is blocked by admin";
    }

    if (thread?.status === "ARCHIVED") {
      return "Chat is archived";
    }

    return "Support chat";
  }, [thread?.status]);

  if (!canRender) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="flex h-115 w-85 flex-col rounded-xl border-2 border-neutral-300 bg-neutral-100 shadow-xl dark:border-neutral-600 dark:bg-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-300 px-4 py-3 dark:border-neutral-600">
            <div>
              <p className="text-sm font-semibold">Admin</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-300">
                {statusLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close chat"
              className="cursor-pointer rounded-full p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {loading ? (
              <p className="text-sm text-neutral-500">Loading...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-neutral-500">No messages yet.</p>
            ) : (
              messages.map((message) => {
                const mine = message.senderUserId === userId;
                return (
                  <div
                    key={message.id}
                    className={`w-fit max-w-[85%] rounded-lg px-3 py-2 text-sm ${mine ? "ml-auto bg-cyan-700 text-white" : "mr-auto bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white"}`}
                  >
                    <p>{message.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${mine ? "text-cyan-100" : "text-neutral-500"}`}
                    >
                      {new Date(message.createdAt).toLocaleString("cs-CZ")}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {error && (
            <div className="px-3 pb-2 text-xs text-red-500">{error}</div>
          )}

          <div className="border-t border-neutral-300 p-3 dark:border-neutral-600">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
              placeholder={
                isBlocked
                  ? "You can't reply to this support chat"
                  : "Write a message..."
              }
              disabled={sending || isBlocked}
              className="w-full resize-none rounded-md border-2 border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-700 dark:border-neutral-600 dark:bg-neutral-900"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || isBlocked || body.trim().length === 0}
              className="mt-2 w-full cursor-pointer rounded-md bg-cyan-800 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-900"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
