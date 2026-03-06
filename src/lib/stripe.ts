import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function hasRealStripeSecretKey(secretKey?: string): secretKey is string {
  return Boolean(secretKey && secretKey.trim() && !secretKey.includes("your_key"));
}

export function isStripeConfigured(): boolean {
  return hasRealStripeSecretKey(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!hasRealStripeSecretKey(secretKey)) {
    throw new Error(
      "Stripe is not configured. Set a real STRIPE_SECRET_KEY before using payments."
    );
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeInstance;
}
