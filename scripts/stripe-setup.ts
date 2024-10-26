import { stripePlans } from "@/lib/config/stripe";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
});

async function createOrUpdateProducts() {
  // First create/update the main product
  const product = await stripe.products.create({
    name: "Mock Interview Subscription",
    description: "Unlimited AI-powered mock interviews with actionable feedback",
  });

  console.log("Created/Updated product:", product.id);

  // Create prices for each plan
  const prices = await Promise.all([
    stripe.prices.create({
      product: product.id,
      unit_amount: stripePlans.monthly.price * 100, // Stripe uses cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        planId: "monthly",
      },
    }),
    stripe.prices.create({
      product: product.id,
      unit_amount: stripePlans.quarterly.price * 100,
      currency: "usd",
      recurring: {
        interval: "month",
        interval_count: 3, // Makes it quarterly
      },
      metadata: {
        planId: "quarterly",
      },
    }),
    stripe.prices.create({
      product: product.id,
      unit_amount: stripePlans.yearly.price * 100,
      currency: "usd",
      recurring: {
        interval: "year",
      },
      metadata: {
        planId: "yearly",
      },
    }),
  ]);

  console.log("Created prices:");
  prices.forEach((price) => {
    console.log(`${price.metadata.planId}: ${price.id}`);
  });

  return {
    product,
    prices,
  };
}

createOrUpdateProducts()
  .then((result) => {
    console.log("\nAdd these to your .env file:");
    console.log(`STRIPE_PRODUCT_ID=${result.product.id}`);
    result.prices.forEach((price) => {
      const envKey = `NEXT_PUBLIC_STRIPE_PRICE_${price.metadata.planId.toUpperCase()}_ID`;
      console.log(`${envKey}=${price.id}`);
    });
  })
  .catch(console.error);
