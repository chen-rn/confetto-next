"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

export async function createCheckoutSession(priceId: string) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const returnUrl = absoluteUrl("/dashboard");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
    metadata: {
      userId,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}

export async function createCustomerPortalSession() {
  const { userId } = auth();

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
