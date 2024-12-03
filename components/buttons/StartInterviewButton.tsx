"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useInterviewEligibility } from "@/lib/hooks/useInterviewEligibility";
import { SubscriptionDialog } from "@/components/dialogs/SubscriptionDialog";

interface StartInterviewButtonProps {
  className?: string;
}

export function StartInterviewButton({ className }: StartInterviewButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const { isEligible, user, hasTrialStarted, remainingCredits, isLoading, error } = useInterviewEligibility();

  // Show loading state if data is being fetched
  if (isLoading) {
    return (
      <Button
        disabled
        size="default"
        className={cn(
          "relative group transition-all duration-300 ease-out rounded-xl",
          "bg-gradient-to-r from-[#635BFF] to-[#5a52f0]",
          "shadow-lg flex items-center gap-3 px-6",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold">Loading</span>
          <span className="flex gap-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
          </span>
        </div>
      </Button>
    );
  }

  // Show error state if there was an error fetching data
  if (error) {
    return (
      <Button
        disabled
        size="default"
        className={cn(
          "relative group transition-all duration-300 ease-out rounded-xl",
          "bg-red-500",
          "shadow-lg flex items-center gap-3 px-6",
          className
        )}
      >
        <span className="font-semibold">Error loading data</span>
      </Button>
    );
  }

  // Show default state if user data is not yet available
  if (!user) {
    return (
      <Button
        disabled
        size="default"
        className={cn(
          "relative group transition-all duration-300 ease-out rounded-xl",
          "bg-gradient-to-r from-[#635BFF] to-[#5a52f0]",
          "shadow-lg flex items-center gap-3 px-6",
          className
        )}
      >
        <span className="font-semibold">Please sign in</span>
      </Button>
    );
  }

  const isTrialUser = user.subscriptionStatus === "TRIAL";

  function handleStartClick() {
    if (isEligible) {
      router.push(ROUTES.MOCK_NEW);
    } else {
      setShowDialog(true);
    }
  }

  return (
    <>
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <Button
          onClick={handleStartClick}
          size="default"
          className={cn(
            "relative group transition-all duration-300 ease-out rounded-xl",
            "bg-gradient-to-r from-[#635BFF] to-[#5a52f0] hover:from-[#5a52f0] hover:to-[#4b44e3]",
            "shadow-lg hover:shadow-xl hover:scale-[1.02]",
            "flex items-center gap-3 px-6"
          )}
        >
          <span className="font-semibold">Start Interview</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>

        {isTrialUser && (
          <Badge
            variant="secondary"
            className="text-xs font-normal bg-transparent border border-slate-200 text-slate-500 shadow-sm"
          >
            {remainingCredits} trial {remainingCredits === 1 ? "interview" : "interviews"} remaining
          </Badge>
        )}

        {user.subscriptionStatus === "ACTIVE" && (
          <span className="text-xs text-neutral-500">Unlimited interviews</span>
        )}
      </div>

      <SubscriptionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        hasTrialStarted={hasTrialStarted}
      />
    </>
  );
}
