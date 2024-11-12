import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import Link from "next/link";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasTrialStarted: boolean;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
  hasTrialStarted,
}: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#635BFF]" />
            {hasTrialStarted ? "Subscribe to Continue" : "Unlock Full Access"}
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-3">
            {hasTrialStarted ? (
              <p>You've used all your trial interviews. Subscribe to continue practicing:</p>
            ) : (
              <>
                <p>Start your free trial to access:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>3 mock interviews with AI feedback</li>
                  <li>Personalized improvement suggestions</li>
                  <li>Interview performance analytics</li>
                </ul>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:flex-row flex-col">
          <Link href="/pricing" prefetch className="sm:flex-1">
            <Button variant="outline" className="w-full">
              {hasTrialStarted ? "Subscribe Now" : "Start Free Trial"}
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
