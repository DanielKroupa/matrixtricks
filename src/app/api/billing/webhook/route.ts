import type { NextRequest } from "next/server";
import { handleBillingWebhook } from "@/interface/http/billing/webhook.controller";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleBillingWebhook(request);
}
