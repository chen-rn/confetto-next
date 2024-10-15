"use client";

import React from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRecording } from "@/hooks/useRecording";
import { isRecordingAtom, isProcessingAtom } from "@/lib/atoms/interviewAtoms";

interface InterviewActionButtonProps {
  mockId: string;
}

export function InterviewActionButton({ mockId }: InterviewActionButtonProps) {
  const [isRecording] = useAtom(isRecordingAtom);
  const [isProcessing] = useAtom(isProcessingAtom);
  const { startRecording, stopRecording } = useRecording(mockId);

  const handleClick = async () => {
    if (!isRecording && !isProcessing) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      startRecording(stream);
    } else if (isRecording && !isProcessing) {
      await stopRecording();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isProcessing}
      className="bg-[#635BFF] hover:bg-[#524ACC] text-white text-sm font-medium tracking-wide"
    >
      {isProcessing ? "Processing..." : isRecording ? "Submit" : "I'm ready to answer"}
      <ChevronRight className="h-4 w-4 ml-2" />
    </Button>
  );
}
