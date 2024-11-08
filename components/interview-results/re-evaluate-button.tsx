"use client";

import { Button } from "@/components/ui/button";
import { processAudioSubmission } from "@/lib/actions/processAudioSubmission";
import { useState } from "react";
import { toast } from "sonner";

export function ReEvaluateButton({ mockInterviewId }: { mockInterviewId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleReEvaluate() {
    try {
      setIsProcessing(true);
      const result = await processAudioSubmission(mockInterviewId);

      if (result.success) {
        toast.success("Re-evaluation started");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to start re-evaluation");
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
