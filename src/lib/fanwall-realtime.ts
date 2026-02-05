type FanwallBroadcastPayload = Record<string, unknown>;

export async function broadcastFanwallEvent(
  event: string,
  payload: FanwallBroadcastPayload,
) {
  const baseUrl = process.env.FANWALL_SOCKET_URL;
  if (!baseUrl) return;

  const url = baseUrl.endsWith("/")
    ? `${baseUrl}broadcast`
    : `${baseUrl}/broadcast`;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event,
        payload,
        secret: process.env.FANWALL_SOCKET_SECRET ?? null,
      }),
    });
  } catch {
    // Ignore realtime failures; API should still succeed.
  }
}
