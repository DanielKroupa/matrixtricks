"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PAGE_SIZE } from "@/components/main/fanwall/message-state";
import type { ApiResponse, FanwallMessage } from "@/types/fanwall";

type UseFanwallPaginationParams = {
  messages: FanwallMessage[];
  otherMessages: FanwallMessage[];
  setMessages: React.Dispatch<React.SetStateAction<FanwallMessage[]>>;
};

export function useFanwallPagination({
  messages,
  otherMessages,
  setMessages,
}: UseFanwallPaginationParams) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const prevMessagesLen = useRef(messages.length);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const previousLength = prevMessagesLen.current;

    if (messages.length > previousLength && isAtBottom) {
      requestAnimationFrame(() => scrollToBottom());
    }

    prevMessagesLen.current = messages.length;
  }, [messages.length, isAtBottom, scrollToBottom]);

  async function loadOlder() {
    if (loadingOlder || !hasMore) return;

    const el = containerRef.current;
    if (!el) return;

    setLoadingOlder(true);

    if (otherMessages.length === 0) {
      setHasMore(false);
      setLoadingOlder(false);
      return;
    }

    const oldest = otherMessages[0];
    const before = new Date(oldest.createdAt).toISOString();

    try {
      const previousScrollHeight = el.scrollHeight;
      const response = await fetch(
        `/api/fanwall/messages?before=${encodeURIComponent(before)}&limit=${PAGE_SIZE}`,
        { cache: "no-store" },
      );

      const data = (await response.json()) as ApiResponse<FanwallMessage>;

      if (!response.ok) {
        return;
      }

      const fetched = data.messages ?? [];
      let added = 0;

      setMessages((previousMessages) => {
        const existingIds = new Set(previousMessages.map((m) => m.id));
        const toPrepend = fetched.filter(
          (message) => !message.isPinned && !existingIds.has(message.id),
        );

        added = toPrepend.length;

        if (added === 0) {
          return previousMessages;
        }

        return [...toPrepend, ...previousMessages];
      });

      if (added === 0) {
        setHasMore(false);
        return;
      }

      requestAnimationFrame(() => {
        const currentHeight = el.scrollHeight;
        el.scrollTop = currentHeight - previousScrollHeight;
      });

      if (fetched.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } finally {
      setLoadingOlder(false);
    }
  }

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const nearTop = el.scrollTop < 120;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;

    setIsAtBottom(nearBottom);

    if (nearTop) {
      void loadOlder();
    }
  }

  return {
    containerRef,
    loadingOlder,
    onScroll,
  };
}
