"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getMessages } from "@/lib/i18n/messages";
import { localeFromPathname } from "@/lib/i18n/routing";
import type { ChatStatus, ThreadDetail, ThreadItem } from "@/types/chat";

const statusOptions: ChatStatus[] = ["OPEN", "ARCHIVED", "BLOCKED"];

export default function AdminChatClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = localeFromPathname(pathname || "/");
  const labels = getMessages(locale).admin;
  const dateLocale = locale === "cs" ? "cs-CZ" : "en-US";
  const statusLabelMap: Record<ChatStatus, string> = {
    OPEN: labels.chatStatusOpen,
    ARCHIVED: labels.chatStatusArchived,
    BLOCKED: labels.chatStatusBlocked,
  };
  const [status, setStatus] = useState<ChatStatus>("OPEN");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ThreadItem[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ThreadDetail | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const prevThreadIdRef = useRef<string | null>(null);
  const prevMessagesCountRef = useRef(0);
  const openedUserIdRef = useRef<string | null>(null);

  const loadThreads = useCallback(async () => {
    setLoadingList(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("status", status);
    if (search.trim()) {
      params.set("query", search.trim());
    }

    try {
      const res = await fetch(`/api/admin/chat/threads?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? labels.chatLoadThreadsFailed);
        return;
      }

      setItems(data.items ?? []);
    } finally {
      setLoadingList(false);
    }
  }, [labels.chatLoadThreadsFailed, search, status]);

  const loadThreadDetail = useCallback(
    async (threadId: string) => {
      setLoadingDetail(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/chat/threads/${threadId}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? labels.chatLoadThreadFailed);
          return;
        }

        setDetail(data);

        if ((data.thread?.unreadForAdmin ?? 0) > 0) {
          await fetch(`/api/admin/chat/threads/${threadId}/read`, {
            method: "POST",
          });
        }
      } finally {
        setLoadingDetail(false);
      }
    },
    [labels.chatLoadThreadFailed],
  );

  const openOrCreateThreadByUserId = useCallback(
    async (userId: string) => {
      setError(null);

      const res = await fetch("/api/admin/chat/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? labels.chatOpenThreadFailed);
        return null;
      }

      return (data.thread?.id as string | undefined) ?? null;
    },
    [labels.chatOpenThreadFailed],
  );

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    const requestedUserId = searchParams.get("userId")?.trim() ?? "";

    if (!requestedUserId || openedUserIdRef.current === requestedUserId) {
      return;
    }

    openedUserIdRef.current = requestedUserId;

    void (async () => {
      const threadId = await openOrCreateThreadByUserId(requestedUserId);

      if (!threadId) {
        return;
      }

      setSelectedThreadId(threadId);
      await loadThreadDetail(threadId);
      await loadThreads();
    })();
  }, [loadThreadDetail, loadThreads, openOrCreateThreadByUserId, searchParams]);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_FANWALL_SOCKET_URL || "http://localhost:3001";

    const socket: Socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on(
      "chat:thread-updated",
      (payload: { threadId?: string; unreadForAdmin?: number }) => {
        if (payload?.threadId && payload.threadId === selectedThreadId) {
          void loadThreadDetail(payload.threadId);
        }

        void loadThreads();
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [loadThreadDetail, loadThreads, selectedThreadId]);

  const selectedThread = useMemo(
    () => items.find((item) => item.thread.id === selectedThreadId) ?? null,
    [items, selectedThreadId],
  );

  const activeThread = selectedThread?.thread ?? detail?.thread ?? null;

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container || !selectedThreadId) {
      return;
    }

    const currentMessagesCount = detail?.messages.length ?? 0;
    const threadChanged = prevThreadIdRef.current !== selectedThreadId;
    const messagesIncreased =
      currentMessagesCount > prevMessagesCountRef.current;

    if (threadChanged || (messagesIncreased && isAtBottom)) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }

    prevThreadIdRef.current = selectedThreadId;
    prevMessagesCountRef.current = currentMessagesCount;
  }, [detail?.messages.length, isAtBottom, selectedThreadId]);

  const onMessagesScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      const nearBottom =
        element.scrollTop + element.clientHeight >= element.scrollHeight - 60;

      setIsAtBottom(nearBottom);
    },
    [],
  );

  const onSelectThread = async (threadId: string) => {
    setSelectedThreadId(threadId);
    await loadThreadDetail(threadId);
    await loadThreads();
  };

  const onSendMessage = async () => {
    if (!selectedThreadId || !messageBody.trim()) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/admin/chat/threads/${selectedThreadId}/messages`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body: messageBody.trim() }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? labels.chatSendFailed);
        return;
      }

      setMessageBody("");
      await loadThreadDetail(selectedThreadId);
      await loadThreads();
    } finally {
      setSending(false);
    }
  };

  const onChangeStatus = async (nextStatus: ChatStatus) => {
    if (!selectedThreadId) {
      return;
    }

    const res = await fetch(
      `/api/admin/chat/threads/${selectedThreadId}/status`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      },
    );

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? labels.chatStatusUpdateFailed);
      return;
    }

    await loadThreads();
    await loadThreadDetail(selectedThreadId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{labels.chatInboxTitle}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-300">
        {labels.chatInboxDescription}
      </p>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium ${status === option ? "bg-cyan-800 text-white dark:bg-cyan-900" : "bg-neutral-200 dark:bg-neutral-700"}`}
          >
            {statusLabelMap[option]}
          </button>
        ))}

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={labels.chatSearchPlaceholder}
          className="min-w-64 rounded-md border-2 border-neutral-300 bg-transparent px-3 py-1.5 text-sm outline-none focus:border-cyan-700 dark:border-neutral-600"
        />

        <button
          type="button"
          title={labels.chatRefreshThreads}
          onClick={() => void loadThreads()}
          className="cursor-pointer rounded-md bg-neutral-300 px-3 py-1.5 text-sm font-medium dark:bg-neutral-700"
        >
          {labels.chatRefresh}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="chat-scroll max-h-128 space-y-2 overflow-y-auto rounded-lg border-2 border-neutral-300 p-2 dark:border-neutral-700">
          {loadingList ? (
            <p className="p-2 text-sm text-neutral-500">
              {labels.chatLoadingThreads}
            </p>
          ) : items.length === 0 ? (
            <p className="p-2 text-sm text-neutral-500">
              {labels.chatNoThreadsFound}
            </p>
          ) : (
            items.map((item) => {
              const active = selectedThreadId === item.thread.id;
              return (
                <button
                  key={item.thread.id}
                  type="button"
                  onClick={() => void onSelectThread(item.thread.id)}
                  className={`w-full cursor-pointer rounded-md border px-3 py-2 text-left ${active ? "border-cyan-700 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-950/30" : "border-neutral-300 dark:border-neutral-700"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {item.thread.user.name}
                    </p>
                    {item.thread.unreadForAdmin > 0 && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                        {item.thread.unreadForAdmin}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-neutral-500">
                    {item.thread.user.email}
                  </p>
                  <p className="mt-1 truncate text-xs">
                    {item.lastMessage?.body ?? labels.chatNoMessages}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div className="flex h-128 min-h-0 flex-col rounded-lg border-2 border-neutral-300 dark:border-neutral-700">
          {!selectedThreadId || !activeThread ? (
            <div className="p-4 text-sm text-neutral-500">
              {labels.chatSelectThread}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 px-4 py-2 dark:border-neutral-700">
                <div>
                  <p className="font-semibold">{activeThread.user.name}</p>
                  <p className="text-xs text-neutral-500">
                    {activeThread.user.email}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    title={labels.chatMoveToOpen}
                    onClick={() => void onChangeStatus("OPEN")}
                    className="cursor-pointer rounded-md bg-neutral-200 px-2 py-1 text-xs dark:bg-neutral-700"
                  >
                    {labels.chatOpen}
                  </button>
                  <button
                    type="button"
                    title={labels.chatArchiveThread}
                    onClick={() => void onChangeStatus("ARCHIVED")}
                    className="cursor-pointer rounded-md bg-neutral-200 px-2 py-1 text-xs dark:bg-neutral-700"
                  >
                    {labels.chatArchive}
                  </button>
                  <button
                    type="button"
                    title={labels.chatBlockThread}
                    onClick={() => void onChangeStatus("BLOCKED")}
                    className="cursor-pointer rounded-md bg-red-700 px-2 py-1 text-xs text-white"
                  >
                    {labels.chatBlock}
                  </button>
                </div>
              </div>

              <div
                ref={messageContainerRef}
                onScroll={onMessagesScroll}
                className="chat-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-4"
              >
                {loadingDetail ? (
                  <p className="text-sm text-neutral-500">
                    {labels.chatLoadingMessages}
                  </p>
                ) : detail?.messages.length ? (
                  detail.messages.map((message) => {
                    const isAdmin = message.senderUser.role === "admin";
                    return (
                      <div
                        key={message.id}
                        className={`max-w-[90%] rounded-lg px-3 py-2 text-sm md:max-w-[80%] ${isAdmin ? "ml-auto bg-cyan-800 text-white" : "mr-auto bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white"}`}
                      >
                        <p>{message.body}</p>
                        <p
                          className={`mt-1 text-[10px] ${isAdmin ? "text-cyan-100" : "text-neutral-500"}`}
                        >
                          {new Date(message.createdAt).toLocaleString(
                            dateLocale,
                          )}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-neutral-500">
                    {labels.chatNoMessagesYet}
                  </p>
                )}
              </div>

              <div className="border-t border-neutral-300 p-3 dark:border-neutral-700">
                <textarea
                  rows={3}
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder={labels.chatWriteReply}
                  className="w-full resize-none rounded-md border-2 border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyan-700 dark:border-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => void onSendMessage()}
                  disabled={sending || messageBody.trim().length === 0}
                  className="mt-2 cursor-pointer rounded-md bg-cyan-800 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-900"
                >
                  {sending ? labels.chatSending : labels.chatSend}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
