import { createAuthClient } from "better-auth/client";
import { nextCookies } from "better-auth/next-js";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL;

export const authClient = createAuthClient({
  baseURL,
  plugins: [inferAdditionalFields<typeof auth>(), nextCookies()],
});
