import type { NextRequest } from "next/server";
import { handleBillingCheckout } from "@/interface/http/billing/checkout.controller";

export async function POST(request: NextRequest) {
  return handleBillingCheckout(request);
}
