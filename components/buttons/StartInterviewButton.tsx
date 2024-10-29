"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Crown } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useQuery } from "@tanstack/react-query";
import { getInterviewCount } from "@/lib/actions/mock-interviews";
import Link from "next/link";
import { useInterviewEligibility } from "@/lib/hooks/useInterviewEligibility";
import { SubscriptionDialog } from "@/components/dialogs/SubscriptionDialog";

interface StartInterviewButtonProps {
  className?: string;
}

export function StartInterviewButton({ className }: StartInterviewButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const { isEligible, user, hasTrialStarted, remainingCredits } = useInterviewEligibility();
  console.log("User eligibility:", {
    isEligible,
    user,
    hasTrialStarted,
    remainingCredits,
  });
  if (!user) return null;

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
