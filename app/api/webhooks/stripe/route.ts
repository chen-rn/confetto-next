import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";
import { stripePlans } from "@/lib/config/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getAccessDuration(priceId: string): number {
  // Find the plan that matches this price ID
  const plan = Object.values(stripePlans).find(p => p.priceId === priceId);
  if (!plan) {
    console.error("Unknown price ID:", priceId);
    return 30 * 24 * 60 * 60 * 1000; // Default to 1 month if unknown
  }

  // Calculate duration in milliseconds based on interval
  const daysInMonth = 30;
  switch (plan.interval) {
    case "month":
      return daysInMonth * 24 * 60 * 60 * 1000;
    case "quarter":
      return 3 * daysInMonth * 24 * 60 * 60 * 1000;
    case "year":
      return 365 * 24 * 60 * 60 * 1000;
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("No userId in session metadata");
    return;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  if (!lineItems.data.length) {
    console.error("No line items found in session");
    return;
  }

  const priceId = lineItems.data[0].price?.id;
  if (!priceId) {
    console.error("No price ID found in line items");
    return;
  }

  const plan = Object.values(stripePlans).find(p => p.priceId === priceId);
  const accessDuration = getAccessDuration(priceId);
  const currentPeriodEnd = new Date(Date.now() + accessDuration);

  console.log("Processing payment success:", {
    userId,
    priceId,
    planName: plan?.name,
    accessDuration: `${accessDuration / (24 * 60 * 60 * 1000)} days`,
    currentPeriodEnd,
    amountTotal: session.amount_total,
    amountDiscount: session.total_details?.amount_discount,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "ACTIVE",
      stripePriceId: priceId,
      currentPeriodEnd,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get("Stripe-Signature");

    if (!webhookSecret) {
      throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    }

    if (!signature) {
      throw new Error("Missing Stripe-Signature header");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log("Received webhook event:", event.type);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await handlePaymentSuccess(session);
        } else {
          console.log("Session not paid:", session.payment_status);
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaymentSuccess(session);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.error("Async payment failed for session:", session.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
