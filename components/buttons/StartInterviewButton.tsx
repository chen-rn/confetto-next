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

interface StartInterviewButtonProps {
  user: User;
  className?: string;
}

const MAX_TRIAL_CREDITS = 3; // Move this to a constants file if used elsewhere

export function StartInterviewButton({ user, className }: StartInterviewButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const isEligible = user.subscriptionStatus === "TRIAL" || user.subscriptionStatus === "ACTIVE";

  const remainingCredits = MAX_TRIAL_CREDITS - (user.trialCreditsUsed || 0);
  const isTrialUser = user.subscriptionStatus === "TRIAL";

  function handleStartClick() {
    if (isEligible) {
      router.push("/interview/new");
    } else {
      setShowDialog(true);
    }
  }

  return (
    <>
      <div className={cn("flex flex-col gap-2", className)}>
        <Button onClick={handleStartClick} className="flex items-center gap-2">
          Start Interview
          <ArrowRight className="w-4 h-4" />
        </Button>

        {isTrialUser && (
          <Badge variant="secondary" className="w-fit">
            {remainingCredits} trial {remainingCredits === 1 ? "interview" : "interviews"} remaining
          </Badge>
        )}

        {user.subscriptionStatus === "ACTIVE" && (
          <Badge variant="secondary" className="w-fit bg-gradient-to-r from-purple-500 to-pink-500">
            <Crown className="w-4 h-4 mr-1" />
            Premium Member
          </Badge>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-500" />
              Unlock Full Access
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-3">
              <p>Start your free trial to access:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>3 mock interviews with AI feedback</li>
                <li>Personalized improvement suggestions</li>
                <li>Interview performance analytics</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:flex-row flex-col">
            <Button variant="outline" onClick={() => router.push("/pricing")} className="sm:flex-1">
              Start Free Trial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
