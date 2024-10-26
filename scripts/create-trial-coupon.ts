import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
});

async function createTrialCoupon() {
  // First create a coupon for 100% off
  const coupon = await stripe.coupons.create({
    name: "100% off first payment (Beta)",
    percent_off: 100,
    duration: "once",
    metadata: {
      description: "Beta testing coupon",
    },
  });

  // Create a promotion code for this coupon
  const promotionCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: "BETA100", // Changed code to be more descriptive
    max_redemptions: 100, // Increased to 100 uses
    expires_at: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // Extended to 90 days
  });

  console.log("Created promotion code:", {
    code: promotionCode.code,
    couponId: coupon.id,
    maxRedemptions: promotionCode.max_redemptions,
    expiresAt: new Date(promotionCode.expires_at! * 1000).toISOString(),
  });

  return promotionCode;
}

createTrialCoupon().then(console.log).catch(console.error);
