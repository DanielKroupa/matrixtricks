import http from "node:http";
import { Server } from "socket.io";

const port = Number(process.env.FANWALL_SOCKET_PORT ?? 3001);

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
        io.emit(payload.event, payload.payload ?? null);
      }

      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
    });

    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
});

io.on("connection", (socket) => {
  socket.emit("fanwall:connected", { ok: true });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Fanwall socket server listening on :${port}`);
});
