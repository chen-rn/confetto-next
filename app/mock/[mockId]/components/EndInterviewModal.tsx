import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

interface EndInterviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export function EndInterviewModal({
  isOpen,
  onOpenChange,
  onSubmit,
  isProcessing,
}: EndInterviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-semibold text-neutral-900">
            End Interview Early?
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-neutral-600">
            You still have time remaining in your interview. Are you sure you want to end early?
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <span>Your response will be submitted as-is</span>
              </div>

              <Link
                href={ROUTES.HOME}
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Return home without submitting →
              </Link>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="ghost"
            className="sm:w-auto w-full hover:bg-neutral-50"
            onClick={() => onOpenChange(false)}
          >
            Continue Interview
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isProcessing}
            className="sm:w-auto w-full bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Submission...
              </>
            ) : (
              "Submit Interview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
