import { cookies, headers } from "next/headers";

const IDENTITY_DEVICE_COOKIE = "matrix_identity_device_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function randomDeviceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function resolveIdentityDeviceId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(IDENTITY_DEVICE_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const next = randomDeviceId();
  cookieStore.set(IDENTITY_DEVICE_COOKIE, next, {
    path: "/",
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return next;
}

export function resolveIpAddressFromRequest(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return null;
}

export async function resolveIpAddressFromServerHeaders() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  const realIp = headerStore.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return null;
}
