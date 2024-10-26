"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { stripePlans } from "@/lib/config/stripe";
import type { SubscriptionStatus } from "@prisma/client";
import { Check } from "lucide-react";
import { useTransition } from "react";
import { createCheckoutSession } from "@/lib/actions/stripe";

interface PricingCardsProps {
  subscriptionStatus?: SubscriptionStatus;
  currentPriceId?: string | null;
  trialStartedAt?: Date | null; // Add this prop
}

export function PricingCards({
  subscriptionStatus,
  currentPriceId,
  trialStartedAt,
}: PricingCardsProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = async (priceId: string) => {
    try {
      console.log("Plan priceId:", priceId); // Debug log

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
    <div className="grid gap-6 md:grid-cols-3">
      {Object.entries(stripePlans).map(([key, plan]) => {
        const isCurrentPlan = currentPriceId === plan.priceId;

        return (
          <Card key={key} className="flex flex-col p-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="ml-1 text-muted-foreground">/{plan.interval}</span>
              </div>
              {!hasHadTrial && (
                <p className="mt-2 text-sm text-muted-foreground">Includes 7-day free trial</p>
              )}
              <ul className="mt-4 space-y-3">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Unlimited Mock Interviews
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  AI-Powered Feedback
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Video Recordings
                </li>
              </ul>
            </div>

            <Button
              className="mt-6"
              disabled={isPending || isCurrentPlan}
              onClick={() => handleSubscribe(plan.priceId)}
            >
              {isCurrentPlan ? "Current Plan" : hasHadTrial ? "Subscribe Now" : "Start Free Trial"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
