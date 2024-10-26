import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PricingCards } from "@/components/pricing/PricingCards";
import { prisma } from "@/lib/apis/prisma";
import { stripePlans } from "@/lib/config/stripe";

export default async function PricingPage() {
  // Validate env vars server-side
  if (
    !process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_ID ||
    !process.env.NEXT_PUBLIC_STRIPE_PRICE_QUARTERLY_ID ||
    !process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_ID
  ) {
    throw new Error("Stripe price IDs not configured");
  }

  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      stripePriceId: true,
      trialStartedAt: true, // Add this field
    },
  });

  // Verify stripe plans are loaded
  console.log("Stripe plans check:", stripePlans);

  return (
    <div className="container max-w-5xl py-8">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-4 text-muted-foreground">
          {user?.trialStartedAt
            ? "Choose a plan to continue"
            : "Start with a 7-day free trial. Cancel anytime."}
        </p>
      </div>

      <PricingCards
        subscriptionStatus={user?.subscriptionStatus}
        currentPriceId={user?.stripePriceId}
        trialStartedAt={user?.trialStartedAt}
      />
    </div>
  );
}
