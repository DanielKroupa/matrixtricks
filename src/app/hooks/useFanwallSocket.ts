"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import {
  removeMessageById,
  upsertMessage,
} from "../components/pageLayout/fanwall/message-state";
import type { FanwallMessage } from "../components/pageLayout/fanwall/types";

type UseFanwallSocketParams = {
  refreshMessages: () => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<FanwallMessage[]>>;
};

export function useFanwallSocket({
  refreshMessages,
  setMessages,
}: UseFanwallSocketParams) {
  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_FANWALL_SOCKET_URL || "http://localhost:3001";

    const socket: Socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("fanwall:created", (message: FanwallMessage) => {
      setMessages((prev) => upsertMessage(prev, message));
    });

    socket.on("fanwall:updated", (message: FanwallMessage) => {
      setMessages((prev) => upsertMessage(prev, message));
    });

    socket.on("fanwall:deleted", ({ id }: { id: string }) => {
      setMessages((prev) => removeMessageById(prev, id));
    });

    socket.on("fanwall:refresh", () => void refreshMessages());

    return () => {
      socket.disconnect();
    };
  }, [refreshMessages, setMessages]);
}
