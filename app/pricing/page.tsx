import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PricingCards } from "@/app/pricing/PricingCards";
import { prisma } from "@/lib/prisma";
import { stripePlans } from "@/lib/config/stripe";
import Link from "next/link";
import { ArrowLeft, Check, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "./BackButton";
import { MAX_TRIAL_CREDITS } from "@/lib/hooks/useInterviewEligibility";
import { getInterviewCount } from "@/lib/actions/mock-interviews";

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

  const interviewCount = await getInterviewCount();
  const trialExhausted =
    user?.subscriptionStatus === "TRIAL" && interviewCount >= MAX_TRIAL_CREDITS;
  const trialActive = user?.subscriptionStatus === "TRIAL" && interviewCount < MAX_TRIAL_CREDITS;

  // Verify stripe plans are loaded
  console.log("Stripe plans check:", stripePlans);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-b from-white to-neutral-100">
      <div className="relative w-full max-w-6xl px-4 py-12">
        <BackButton />

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#635BFF] to-purple-600 bg-clip-text text-transparent">
            {trialExhausted ? "Upgrade Your Account" : "Choose Your Plan"}
          </h1>
          <p className="text-lg text-neutral-700 font-medium max-w-2xl mx-auto">
            {trialExhausted
              ? "Ready to unlock unlimited interviews? Upgrade your account now."
              : trialActive
              ? `You have ${MAX_TRIAL_CREDITS - interviewCount} interviews remaining in your trial.`
              : user?.trialStartedAt
              ? "Choose a plan to continue your interview preparation journey"
              : "Start with a 7-day free trial. Upgrade, downgrade, or cancel anytime."}
          </p>
          <div className="text-sm text-neutral-500 flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-[#635BFF]" />
            All plans include full access to AI mock interviews and personalized feedback
          </div>
        </div>

        <div className="mt-12">
          <PricingCards
            subscriptionStatus={user?.subscriptionStatus}
            currentPriceId={user?.stripePriceId}
            trialStartedAt={user?.trialStartedAt}
            interviewCount={interviewCount}
          />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-500 flex items-center justify-center gap-2">
            <ShieldQuestion className="h-4 w-4" />
            Questions about our plans?{" "}
            <span className="text-[#635BFF] hover:text-[#635BFF]/90 cursor-pointer font-medium transition-colors">
              Contact support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
