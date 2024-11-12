"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useInterviewEligibility } from "@/lib/hooks/useInterviewEligibility";
import { SubscriptionDialog } from "@/components/dialogs/SubscriptionDialog";

interface PracticeQuestionButtonProps {
  questionId: string;
  className?: string;
}

export function PracticeQuestionButton({ questionId, className }: PracticeQuestionButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const { isEligible, hasTrialStarted, user } = useInterviewEligibility();

  if (!user) return null;

  function handleStartClick() {
    if (isEligible) {
      router.push(`${ROUTES.START_INTERVIEW}?questionId=${questionId}`);
    } else {
      setShowDialog(true);
    }
  }

  return (
    <>
      <Button size="sm" onClick={handleStartClick} className={className}>
        <Play className="h-3.5 w-3.5 mr-1.5" />
        Practice
      </Button>

      <SubscriptionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        hasTrialStarted={hasTrialStarted}
      />
    </>
  );
}
