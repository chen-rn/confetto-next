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
import { Sparkles, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getUserSubscription } from "@/lib/actions/subscription";
import Link from "next/link";
import { getInterviewCount } from "@/lib/actions/mock-interviews";
import type { SubscriptionStatus } from "@prisma/client";
import type { UserSubscription } from "@/lib/actions/subscription";

const subscriptionStatusMap: Record<
  SubscriptionStatus,
  {
    label: string;
    color: string;
  }
> = {
  NOT_SUBSCRIBED: {
    label: "No Access",
    color: "bg-slate-100 text-slate-600",
  },
  TRIAL: {
    label: "Trial",
    color: "bg-[#635BFF]/10 text-[#635BFF]",
  },
  ACTIVE: {
    label: "Active",
    color: "bg-[#635BFF]/10 text-[#635BFF]",
  },
  PAST_DUE: {
    label: "Expired",
    color: "bg-red-100 text-red-600",
  },
  CANCELED: {
    label: "Expired",
    color: "bg-slate-100 text-slate-600",
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-slate-100 text-slate-600",
  },
} as const;

export function SubscriptionSettings() {
  const { user: clerkUser } = useUser();

  const { data: subscription, isLoading } = useQuery<UserSubscription | null>({
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
  const isActive = subscription.subscriptionStatus === "ACTIVE";

  const remainingCredits = Math.max(0, 3 - interviewCount);
  const trialEnded = isTrialUser && remainingCredits === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#635BFF]" />
          Interview Access
        </CardTitle>
        <CardDescription>Manage your interview access and billing details</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            {(trialEnded) && (
              <span className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Trial ended
              </span>
            )}
          </div>
        </div>

        {/* Access Details */}
        <div className="space-y-4">
          {subscription.currentPeriodEnd && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#635BFF]" />
                {isTrialUser ? "Trial Ends" : "Access Expires"}
              </div>
              <div className="font-medium">{formatDate(subscription.currentPeriodEnd)}</div>
            </div>
          )}

          {isTrialUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4 text-[#635BFF]" />
                <span>
                  <span className="font-medium">{remainingCredits} of 3</span> trial interviews
                  remaining
                </span>
              </div>
              {remainingCredits === 0 && (
                <div className="text-sm text-muted-foreground bg-neutral-50 p-3 rounded-lg">
                  You've used all your trial interviews. Purchase access to continue practicing!
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        {isActive ? (
          <Link href="/pricing" className="w-full sm:w-auto" prefetch>
            <Button variant="outline" className="w-full hover:bg-[#635BFF]/5">
              Extend Access
            </Button>
          </Link>
        ) : (
          <Link href="/pricing" className="w-full sm:w-auto" prefetch>
            <Button className="w-full bg-[#635BFF] hover:bg-[#635BFF]/90">
              {isTrialUser ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {trialEnded ? "Purchase Access" : "Get Full Access"}
                </>
              ) : (
                "View Plans"
              )}
            </Button>
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
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-40" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}
