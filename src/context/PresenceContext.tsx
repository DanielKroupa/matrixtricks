"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

type PresenceContextValue = {
  isSelfOnline: boolean;
  visibilityEnabled: boolean;
  setVisibilityEnabled: (enabled: boolean) => void;
  presenceStatuses: Record<string, boolean>;
  requestStatuses: (userIds: string[]) => Promise<void>;
};

const PresenceContext = createContext<PresenceContextValue | undefined>(
  undefined,
);

const HEARTBEAT_MS = 25_000;

type PresenceProviderProps = {
  children: React.ReactNode;
  userId: string | null;
  initialVisibilityEnabled: boolean;
};

export function PresenceProvider({
  children,
  userId,
  initialVisibilityEnabled,
}: PresenceProviderProps) {
  const [visibilityEnabled, setVisibilityEnabledState] = useState(
    initialVisibilityEnabled,
  );
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [presenceStatuses, setPresenceStatuses] = useState<
    Record<string, boolean>
  >({});
  const socketRef = useRef<Socket | null>(null);
  const visibilityRef = useRef(initialVisibilityEnabled);

  useEffect(() => {
    setVisibilityEnabledState(initialVisibilityEnabled);
    visibilityRef.current = initialVisibilityEnabled;
  }, [initialVisibilityEnabled]);

  const requestStatuses = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) {
      return;
    }

    const uniqueIds = [...new Set(userIds.filter(Boolean))].slice(0, 200);
    if (uniqueIds.length === 0) {
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_FANWALL_SOCKET_URL || "http://localhost:3001";
    const params = new URLSearchParams({ userIds: uniqueIds.join(",") });

    try {
      const response = await fetch(
        `${socketUrl}/presence?${params.toString()}`,
      );
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        statuses?: Record<string, boolean>;
      };

      if (!payload.statuses) {
        return;
      }

      setPresenceStatuses((prev) => ({
        ...prev,
        ...payload.statuses,
      }));
    } catch {
      // Ignore network errors for presence snapshot.
    }
  }, []);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_FANWALL_SOCKET_URL || "http://localhost:3001";

    const socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    const emitPresence = (
      eventName: "presence:join" | "presence:heartbeat",
    ) => {
      if (!userId) {
        return;
      }

      socket.emit(eventName, {
        userId,
        visible: visibilityRef.current,
      });
    };

    socket.on("connect", () => {
      setIsSocketConnected(true);
      emitPresence("presence:join");
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    socket.on(
      "presence:update",
      (payload: { userId?: string; isOnline?: boolean }) => {
        if (!payload.userId) {
          return;
        }

        setPresenceStatuses((prev) => ({
          ...prev,
          [payload.userId as string]: Boolean(payload.isOnline),
        }));
      },
    );

    const heartbeatId = window.setInterval(() => {
      emitPresence("presence:heartbeat");
    }, HEARTBEAT_MS);

    return () => {
      window.clearInterval(heartbeatId);
      if (userId) {
        socket.emit("presence:leave");
      }
      socket.disconnect();
      socketRef.current = null;
      setIsSocketConnected(false);
    };
  }, [userId]);

  const setVisibilityEnabled = useCallback(
    (enabled: boolean) => {
      setVisibilityEnabledState(enabled);
      visibilityRef.current = enabled;

      const socket = socketRef.current;
      if (socket && userId) {
        socket.emit("presence:join", {
          userId,
          visible: enabled,
        });
      }
    },
    [userId],
  );

  const value = useMemo(
    () => ({
      isSelfOnline: Boolean(userId && visibilityEnabled && isSocketConnected),
      visibilityEnabled,
      setVisibilityEnabled,
      presenceStatuses,
      requestStatuses,
    }),
    [
      isSocketConnected,
      presenceStatuses,
      requestStatuses,
      setVisibilityEnabled,
      userId,
      visibilityEnabled,
    ],
  );

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);

  if (!context) {
    throw new Error("usePresence must be used within PresenceProvider");
  }

  return context;
}

export function usePresenceStatuses(userIds: Array<string | null | undefined>) {
  const { presenceStatuses, requestStatuses } = usePresence();

  const normalizedIds = useMemo(
    () => [...new Set(userIds.filter(Boolean) as string[])],
    [userIds],
  );

  useEffect(() => {
    void requestStatuses(normalizedIds);
  }, [normalizedIds, requestStatuses]);

  return useMemo(() => {
    const statuses: Record<string, boolean> = {};

    for (const userId of normalizedIds) {
      statuses[userId] = Boolean(presenceStatuses[userId]);
    }

    return statuses;
  }, [normalizedIds, presenceStatuses]);
}
