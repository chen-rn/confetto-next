"use client";

import { Button } from "@/components/ui/button";
import { processAudioSubmission } from "@/lib/actions/processAudioSubmission";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function ReEvaluateButton({ mockInterviewId }: { mockInterviewId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  async function handleReEvaluate() {
    try {
      setIsProcessing(true);
      const result = await processAudioSubmission(mockInterviewId);

      if (result.success) {
        toast({
          title: "Re-evaluation started",
          variant: "default",
        });
      } else {
        toast({
          title: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to start re-evaluation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="flex justify-center">
      <Button variant="outline" onClick={handleReEvaluate} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Re-evaluate Response"}
      </Button>
    </div>
  );
}
