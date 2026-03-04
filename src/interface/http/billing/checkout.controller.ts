import { type NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/interface/schemas/billing/checkout.schema";
import { getServerSession } from "@/lib/get-session";
import { stripeBillingService } from "@/services/billing/stripe-billing.service";

export async function handleBillingCheckout(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const parsed = checkoutSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const origin =
      request.headers.get("origin") ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3000";

    const checkoutSession = await stripeBillingService.createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      origin,
      currency: parsed.data.currency,
      interval: parsed.data.interval,
    });

    return NextResponse.json({
      id: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Failed to create Stripe checkout session", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
