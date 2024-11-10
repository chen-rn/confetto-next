"use client";

import { InterviewResults } from "@/components/interview-results";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage({ params }: { params: { mockId: string } }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return <InterviewResults mockInterviewId={params.mockId} />;
}
