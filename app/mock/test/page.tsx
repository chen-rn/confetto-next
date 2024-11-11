"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function TestPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setOpen(false);
    }, 2000);
  };

  return (
    <div className="p-8">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open End Interview Modal</Button>
        </DialogTrigger>
        <DialogContent className="p-6">
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
              onClick={() => setOpen(false)}
            >
              Continue Interview
            </Button>
            <Button
              onClick={handleSubmit}
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
    </div>
  );
}
