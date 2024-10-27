"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { stripePlans } from "@/lib/config/stripe";
import type { SubscriptionStatus } from "@prisma/client";
import { Check } from "lucide-react";
import { useTransition } from "react";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { cva } from "class-variance-authority";
const cardVariants = cva(
  [
    `flex h-[450px] w-[275px] shrink-0 grow-0
    flex-col justify-between rounded-[20px] px-6 py-6`,
  ],
  {
    variants: {
      variant: {
        recommended: "border-2 border-purple-500 shadow-lg",
        regular: "border border-gray-200 bg-white",
      },
    },
    defaultVariants: {
      variant: "regular",
    },
  }
);

interface PricingCardsProps {
  subscriptionStatus?: SubscriptionStatus;
  currentPriceId?: string | null;
  trialStartedAt?: Date | null;
}

export function PricingCards({
  subscriptionStatus,
  currentPriceId,
  trialStartedAt,
}: PricingCardsProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = async (priceId: string) => {
    try {
      console.log("Plan priceId:", priceId);

      if (!priceId) {
        console.error("Price ID is undefined");
        return;
      }

      startTransition(async () => {
        const url = await createCheckoutSession(priceId);
        if (url) window.location.href = url;
      });
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  const hasHadTrial = trialStartedAt !== null;

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {Object.entries(stripePlans).map(([key, plan], index) => {
        const isCurrentPlan = currentPriceId === plan.priceId;
        const isRecommended = index === 1;

        return (
          <div
            key={key}
            className={cardVariants({ variant: isRecommended ? "recommended" : "regular" })}
          >
            <div className="flex flex-col">
              {isRecommended && (
                <div className="w-fit rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-medium text-white">
                  Most popular
                </div>
              )}
              <h3 className="mt-4 text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="ml-2 text-muted-foreground">/{plan.interval}</span>
              </div>
              {!hasHadTrial && (
                <p className="mt-2 text-sm text-muted-foreground">Includes 7-day free trial</p>
              )}
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">This includes:</p>
                <ul className="mt-4 space-y-4">
                  <li className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    Unlimited Mock Interviews
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    AI-Powered Feedback
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    Video Recordings
                  </li>
                </ul>
              </div>
            </div>

            <Button
              className={`mt-6 w-full rounded-2xl ${
                isRecommended
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  : ""
              }`}
              variant={isRecommended ? "default" : "outline"}
              disabled={isPending || isCurrentPlan}
              onClick={() => handleSubscribe(plan.priceId)}
            >
              {isCurrentPlan ? "Current Plan" : hasHadTrial ? "Subscribe Now" : "Start Free Trial"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
