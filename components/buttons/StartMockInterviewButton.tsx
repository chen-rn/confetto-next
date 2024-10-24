"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { createMockInterview } from "@/lib/actions/createMockInterview";

interface StartMockInterviewButtonProps {
  questionId: string;
  userId: string;
}

export function StartMockInterviewButton({ questionId, userId }: StartMockInterviewButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartMockInterview = async () => {
    setIsLoading(true);
    try {
      const mockId = await createMockInterview(questionId, userId);
      router.push(ROUTES.MOCK(mockId));
    } catch (error) {
      console.error("Failed to start mock interview:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleStartMockInterview} disabled={isLoading}>
      {isLoading ? "Starting..." : "Start"}
    </Button>
  );
}
