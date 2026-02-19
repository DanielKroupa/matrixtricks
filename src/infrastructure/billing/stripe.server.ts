import { loadStripe, Stripe } from "@stripe/stripe-js";
let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
    throw new Error("Missing Stripe Public Key");
  }
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string,
    );
  }
  return stripePromise;
};
