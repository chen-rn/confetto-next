"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

export async function createCheckoutSession(priceId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has already had a trial
  const hasHadTrial = user.trialStartedAt !== null;

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: {
        userId: user.id,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customer.id,
        // Update trial and subscription status when starting trial
        trialStartedAt: new Date(),
        subscriptionStatus: SubscriptionStatus.TRIAL,
      },
    });

    stripeCustomerId = customer.id;
  }

  // Change the return URL based on whether it's a new trial or not
  const returnUrl = hasHadTrial ? absoluteUrl("/dashboard") : absoluteUrl("/welcome");

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      },
    ],
    allow_promotion_codes: true,
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
    subscription_data: {
      // Only add trial period if user hasn't had one before
      ...(hasHadTrial ? {} : { trial_period_days: 7 }),
      metadata: {
        userId,
      },
    },
    metadata: {
      userId,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}

// Add this new function to the existing file

export async function createCustomerPortalSession() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No billing information found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: absoluteUrl("/settings"),
  });

  return session.url;
}
