import { type NextRequest, NextResponse } from "next/server";
import { stripeBillingService } from "@/application/billing/stripe-billing.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const payload = await request.text();
    const result = await stripeBillingService.handleWebhookEvent(
      payload,
      signature,
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 400 },
    );
  }
}
