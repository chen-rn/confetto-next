"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getRandomQuestion } from "@/lib/actions/getRandomQuestion";
import { ROUTES } from "@/lib/routes";

export function QuickStartButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickStart = async () => {
    setIsLoading(true);
    try {
      const { mockId } = await getRandomQuestion();
      router.push(ROUTES.MOCK(mockId));
    } catch (error) {
      console.error("Error starting quick mock:", error);
      // You might want to show an error message to the user here
    } finally {
    }
  };

  return (
    <Button onClick={handleQuickStart} disabled={isLoading}>
      {isLoading ? "Loading..." : "Quick Start"}
    </Button>
  );
}
