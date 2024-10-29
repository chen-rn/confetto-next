"use client";

import { Button } from "@/components/ui/button";
import { stripePlans } from "@/lib/config/stripe";
import type { SubscriptionStatus } from "@prisma/client";
import { Check, Zap, Shield, Video, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

const cardVariants = cva(
  [
    `flex h-[420px] w-[300px] shrink-0 grow-0
    flex-col rounded-2xl px-6 py-6
    transition-all duration-200 hover:shadow-lg`,
  ],
  {
    variants: {
      variant: {
        recommended: "border-2 border-[#635BFF] shadow-md bg-white relative",
        regular: "border border-neutral-200 bg-white hover:border-[#635BFF]/30",
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

const features = [
  {
    icon: Zap,
    text: "Unlimited Mock Interviews",
    description: "Practice as much as you need",
  },
  {
    icon: Shield,
    text: "AI-Powered Feedback",
    description: "Get instant, detailed feedback",
  },
  {
    icon: Video,
    text: "Video Recordings",
    description: "Review and improve your performance",
  },
];

function calculateSavings(monthlyPrice: number, actualPrice: number, interval: string) {
  const months = interval === "quarter" ? 3 : 12;
  const regularPrice = monthlyPrice * months;
  const savings = ((regularPrice - actualPrice) / regularPrice) * 100;
  const amountSaved = regularPrice - actualPrice;
  return { percentage: Math.round(savings), amount: amountSaved };
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
    <div className="flex flex-wrap justify-center gap-6 px-4">
      {Object.entries(stripePlans).map(([key, plan], index) => {
        const isCurrentPlan = currentPriceId === plan.priceId;
        const isRecommended = index === 1;
        const savings =
          plan.interval !== "month" ? calculateSavings(199, plan.price, plan.interval) : null;

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cardVariants({ variant: isRecommended ? "recommended" : "regular" })}
          >
            {isRecommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#635BFF] px-4 py-1.5 rounded-full text-xs font-medium text-white shadow-sm">
                  Most popular
                </span>
              </div>
            )}

            <div className="flex flex-col h-full">
              {/* Header Section */}
              <div>
                <h3 className="text-xl font-bold text-neutral-900">{plan.name}</h3>

                {/* Pricing Section */}
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold text-neutral-900">${plan.price}</span>
                    <span className="text-neutral-500">/{plan.interval}</span>
                  </div>

                  {/* Savings Badge */}
                  {savings && (
                    <div className="mt-2">
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Save {savings.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Section */}
              <div className="mt-6 flex-1">
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 rounded-lg bg-[#635BFF]/5 p-1.5">
                        <feature.icon className="h-4 w-4 text-[#635BFF]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{feature.text}</p>
                        <p className="text-xs text-neutral-500">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Trial Info */}
                {!hasHadTrial && (
                  <p className="mt-3 text-sm text-neutral-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" />
                    Includes 7-day free trial
                  </p>
                )}
              </div>

              {/* Button Section */}
              <Button
                className={`w-full rounded-xl py-4 ${
                  isRecommended
                    ? "bg-[#635BFF] hover:bg-[#635BFF]/90 text-white shadow-sm"
                    : "border-2 border-[#635BFF] text-[#635BFF] hover:bg-[#635BFF]/5"
                }`}
                variant={isRecommended ? "default" : "outline"}
                disabled={isPending || isCurrentPlan}
                onClick={() => handleSubscribe(plan.priceId)}
              >
                {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <span className="font-medium">
                    {isCurrentPlan
                      ? "Current Plan"
                      : hasHadTrial
                      ? "Subscribe Now"
                      : "Start Free Trial"}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
