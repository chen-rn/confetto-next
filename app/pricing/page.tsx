import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PricingCards } from "@/app/pricing/PricingCards";
import { prisma } from "@/lib/prisma";
import { stripePlans } from "@/lib/config/stripe";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      trialStartedAt: true,
    },
  });

  // Verify stripe plans are loaded
  console.log("Stripe plans check:", stripePlans);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start bg-[#F7F9FC]">
      <div className="relative w-full max-w-6xl px-4 py-16">
        <Link
          href="/"
          className="absolute left-4 top-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            {user?.trialStartedAt
              ? "Choose a plan to continue your journey"
              : "Start with a 7-day free trial. Upgrade, downgrade, or cancel anytime."}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            All plans include full access to AI mock interviews and personalized feedback
          </div>
        </div>

        <div className="mt-12">
          <PricingCards
            subscriptionStatus={user?.subscriptionStatus}
            currentPriceId={user?.stripePriceId}
            trialStartedAt={user?.trialStartedAt}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Questions about our plans?{" "}
            <span className="text-purple-600 hover:text-purple-700 cursor-pointer">
              Contact support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
