import http from "node:http";
import { Server } from "socket.io";

const port = Number(process.env.FANWALL_SOCKET_PORT ?? 3001);
const PRESENCE_TIMEOUT_MS = 60_000;

type PresenceSocketState = {
  userId: string;
  visible: boolean;
  lastHeartbeatAt: number;
};

const presenceSockets = new Map<string, PresenceSocketState>();
const lastComputedOnline = new Map<string, boolean>();

function isAllowedBroadcastEvent(eventName: string) {
  return (
    eventName.startsWith("fanwall:") ||
    eventName.startsWith("chat:") ||
    eventName.startsWith("presence:")
  );
}

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL ?? "*",
    methods: ["GET", "POST"],
  },
});

server.on("request", (req, res) => {
  const host = req.headers.host ?? `localhost:${port}`;
  const url = new URL(req.url ?? "/", `http://${host}`);

  if (url.pathname === "/health") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
    return;
  }

  if (url.pathname === "/broadcast" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const secret = process.env.FANWALL_SOCKET_SECRET;
      let payload: { event?: string; payload?: unknown; secret?: string } = {};

      try {
        payload = body ? JSON.parse(body) : {};
      } catch {
        res.writeHead(400, { "content-type": "text/plain" });
        res.end("invalid payload");
        return;
      }

      if (secret && payload.secret !== secret) {
        res.writeHead(401, { "content-type": "text/plain" });
        res.end("unauthorized");
        return;
      }

      if (payload.event) {
        if (!isAllowedBroadcastEvent(payload.event)) {
          res.writeHead(400, { "content-type": "text/plain" });
          res.end("unsupported event");
          return;
        }

        io.emit(payload.event, payload.payload ?? null);
      }

      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
    });

    return;
  }

  if (url.pathname === "/presence" && req.method === "GET") {
    const userIdsParam = url.searchParams.get("userIds") ?? "";
    const userIds = userIdsParam
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 200);

    const payload = getPresenceSnapshot(userIds);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(payload));
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
});

function getPresenceSnapshot(userIds: string[]) {
  const now = Date.now();
  const result: Record<string, boolean> = {};

  for (const userId of userIds) {
    result[userId] = isUserOnline(userId, now);
  }

  return {
    timeoutMs: PRESENCE_TIMEOUT_MS,
    statuses: result,
  };
}

function isUserOnline(userId: string, now: number) {
  for (const state of presenceSockets.values()) {
    if (state.userId !== userId) {
      continue;
    }

    if (!state.visible) {
      continue;
    }

    if (now - state.lastHeartbeatAt <= PRESENCE_TIMEOUT_MS) {
      return true;
    }
  }

  return false;
}

function emitPresenceDelta() {
  const now = Date.now();
  const allUserIds = new Set<string>();

  for (const state of presenceSockets.values()) {
    allUserIds.add(state.userId);
  }

  for (const userId of allUserIds) {
    const isOnline = isUserOnline(userId, now);
    const previous = lastComputedOnline.get(userId);

    if (previous === isOnline) {
      continue;
    }

    lastComputedOnline.set(userId, isOnline);
    io.emit("presence:update", { userId, isOnline });
  }

  for (const [userId] of lastComputedOnline) {
    if (!allUserIds.has(userId)) {
      if (lastComputedOnline.get(userId) !== false) {
        io.emit("presence:update", { userId, isOnline: false });
      }
      lastComputedOnline.delete(userId);
    }
  }
}

const presenceInterval = setInterval(() => {
  emitPresenceDelta();
}, 10_000);

presenceInterval.unref();

io.on("connection", (socket) => {
  socket.emit("fanwall:connected", { ok: true });

  const upsertPresence = (payload: { userId?: string; visible?: boolean }) => {
    const userId = payload.userId?.trim();
    if (!userId) {
      return;
    }

    const previous = presenceSockets.get(socket.id);
    if (previous?.userId && previous.userId !== userId) {
      emitPresenceDelta();
    }

    presenceSockets.set(socket.id, {
      userId,
      visible: payload.visible ?? true,
      lastHeartbeatAt: Date.now(),
    });

    const isOnline = isUserOnline(userId, Date.now());
    socket.emit("presence:self", {
      userId,
      isOnline,
      visible: payload.visible ?? true,
    });
    emitPresenceDelta();
  };

  socket.on(
    "presence:join",
    (payload: { userId?: string; visible?: boolean }) => {
      upsertPresence(payload);
    },
  );

  socket.on(
    "presence:heartbeat",
    (payload: { userId?: string; visible?: boolean }) => {
      upsertPresence(payload);
    },
  );

  socket.on("presence:leave", () => {
    const previous = presenceSockets.get(socket.id);
    presenceSockets.delete(socket.id);

    if (previous?.userId) {
      const isOnline = isUserOnline(previous.userId, Date.now());
      socket.emit("presence:self", {
        userId: previous.userId,
        isOnline,
        visible: previous.visible,
      });
    }

    emitPresenceDelta();
  });

  socket.on("disconnect", () => {
    presenceSockets.delete(socket.id);
    emitPresenceDelta();
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Fanwall socket server listening on :${port}`);
});
