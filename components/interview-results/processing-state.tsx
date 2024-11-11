"use client";

import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMockInterview } from "@/lib/actions/getMockInterview";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Query } from "@tanstack/react-query";

interface ProcessingStateProps {
  mockId: string;
}

type MockInterviewWithFeedback = NonNullable<Awaited<ReturnType<typeof getMockInterview>>>;

export function ProcessingState({ mockId }: ProcessingStateProps) {
  const router = useRouter();

  const { data: mockInterview } = useQuery({
    queryKey: ["mockInterview", mockId],
    queryFn: () => getMockInterview(mockId),
    refetchInterval: (query) => {
      const data = query.state.data as MockInterviewWithFeedback;
      if (data?.feedback?.status === "COMPLETED" || data?.feedback?.status === "FAILED") {
        return false;
      }
      return 3000;
    },
  });

  useEffect(() => {
    if (mockInterview?.feedback?.status === "COMPLETED") {
      router.refresh();
    }
  }, [mockInterview?.feedback?.status, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <Loader2 className="h-10 w-10 animate-spin text-[#635BFF]" />
      <h2 className="text-xl font-semibold">Processing Your Interview</h2>
      <p className="text-center text-muted-foreground">
        We're analyzing your responses and preparing detailed feedback. This may take a few minutes.
      </p>
      {mockInterview?.feedback?.status === "FAILED" && (
        <p className="text-center text-red-500">
          There was an error processing your interview. Please try again later.
        </p>
      )}
    </div>
  );
}
