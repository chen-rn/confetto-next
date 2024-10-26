"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createCustomerPortalSession } from "@/lib/actions/stripe";
import { stripePlans } from "@/lib/config/stripe";
import type { SubscriptionStatus } from "@prisma/client";
import { CreditCard, Loader2, ExternalLink } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface SubscriptionSettingsProps {
  subscriptionStatus: SubscriptionStatus;
  stripePriceId: string | null;
  currentPeriodEnd: Date | null;
}

export function SubscriptionSettings({
  subscriptionStatus,
  stripePriceId,
  currentPeriodEnd,
}: SubscriptionSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentPlan = Object.values(stripePlans).find((plan) => plan.priceId === stripePriceId);

  const handleManageBilling = async () => {
    startTransition(async () => {
      const url = await createCustomerPortalSession();
      if (url) window.location.href = url;
    });
  };

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  const isSubscribed = ["ACTIVE", "TRIAL"].includes(subscriptionStatus);
  const isTrialing = subscriptionStatus === "TRIAL";

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Subscription</h3>
      <div className="space-y-4">
        <div className="grid gap-1">
          <p className="text-sm font-medium">Plan</p>
          <p className="text-sm text-muted-foreground">{currentPlan?.name || "No active plan"}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-medium">Status</p>
          <p className="text-sm text-muted-foreground">
            {subscriptionStatus === "NOT_SUBSCRIBED" ? "Not subscribed" : subscriptionStatus}
          </p>
        </div>
        {currentPeriodEnd && (
          <div className="grid gap-1">
            <p className="text-sm font-medium">{isTrialing ? "Trial ends" : "Next billing date"}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        )}

        {isSubscribed ? (
          <Button onClick={handleManageBilling} disabled={isPending} className="w-full sm:w-auto">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Manage Billing
          </Button>
        ) : (
          <Button onClick={handleUpgrade} className="w-full sm:w-auto" variant="default">
            <ExternalLink className="mr-2 h-4 w-4" />
            Start Free Trial
          </Button>
        )}
      </div>
    </Card>
  );
}
