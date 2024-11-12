import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

// Add debug logging
console.log("Environment variables check:", {
  monthlyPrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID,
  quarterlyPrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY_ID,
  yearlyPrice: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_ID,
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-10-28.acacia",
});
