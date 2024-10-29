"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { Crown, Calendar, CreditCard, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getUserSubscription } from "@/lib/actions/subscription";
import type { User } from "@prisma/client";
import Link from "next/link";
import { getInterviewCount } from "@/lib/actions/mock-interviews";
import { createCustomerPortalSession } from "@/lib/actions/stripe";
import { useState } from "react";

const subscriptionStatusMap = {
  NOT_SUBSCRIBED: {
    label: "No Subscription",
    color: "text-slate-500",
  },
  TRIAL: {
    label: "Trial",
    color: "text-blue-500",
  },
  ACTIVE: {
    label: "Active",
    color: "text-green-500",
  },
  PAST_DUE: {
    label: "Past Due",
    color: "text-yellow-500",
  },
  CANCELED: {
    label: "Canceled",
    color: "text-red-500",
  },
  EXPIRED: {
    label: "Expired",
    color: "text-slate-500",
  },
} as const;

export function SubscriptionSettings() {
  const { user: clerkUser } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => getUserSubscription(),
  });

  const { data: interviewCount = 0 } = useQuery({
    queryKey: ["interviewCount"],
    queryFn: () => getInterviewCount(),
  });

  if (isLoading) {
    return <SubscriptionSkeleton />;
  }

  if (!subscription || !clerkUser) {
    return null;
  }

  const status = subscriptionStatusMap[subscription.subscriptionStatus];
  const isTrialUser = subscription.subscriptionStatus === "TRIAL";
  const isPastDue = subscription.subscriptionStatus === "PAST_DUE";
  const isActive = subscription.subscriptionStatus === "ACTIVE";

  const remainingCredits = Math.max(0, 3 - interviewCount);

  async function handlePortalRedirect() {
    try {
      setIsRedirecting(true);
      const url = await createCustomerPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error("Error redirecting to portal:", error);
    } finally {
      setIsRedirecting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-500" />
          Subscription
        </CardTitle>
        <CardDescription>Manage your subscription and billing details</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="flex items-center gap-3">
            <Badge
              variant={isPastDue ? "destructive" : "secondary"}
              className={`font-medium ${status.color}`}
            >
              {status.label}
            </Badge>
            {isPastDue && (
              <span className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Action required
              </span>
            )}
          </div>
        </div>

        {/* Plan Details */}
        {(isActive || isTrialUser) && (
          <div>
            <div className="grid gap-4">
              {subscription.currentPeriodEnd && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {isTrialUser ? "Trial Ends" : "Next Billing Date"}
                  </div>
                  <div className="font-medium">{formatDate(subscription.currentPeriodEnd)}</div>
                </div>
              )}
            </div>

            {isTrialUser && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{remainingCredits} of 3</span> trial interviews
                remaining
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isActive || isPastDue ? (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handlePortalRedirect}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Manage Subscription"
            )}
          </Button>
        ) : (
          <Link href="/pricing" className="w-full sm:w-auto" prefetch>
            <Button className="w-full">{isTrialUser ? "Upgrade to Premium" : "View Plans"}</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

function SubscriptionSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full sm:w-32" />
      </CardFooter>
    </Card>
  );
}
