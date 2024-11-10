import { HeaderCard } from "./header-card";
import { PerformanceAnalysis } from "./performance-analysis";
import { ResponseAnalysis } from "./response-analysis";
import { AnswerKey } from "./answer-key";
import { ProcessingState } from "./processing-state";
import { prisma } from "@/lib/prisma";
import { ReEvaluateButton } from "./re-evaluate-button";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function InterviewResults({ mockInterviewId }: { mockInterviewId: string }) {
  const interview = await prisma.mockInterview.findUnique({
    where: { id: mockInterviewId },
    select: {
      recordingUrl: true,
      videoUrl: true,
      recordingTranscription: true,
      feedback: {
        select: { id: true },
      },
    },
  });

  const hasRecording = Boolean(interview?.recordingUrl || interview?.videoUrl);
  const hasNoFeedback = !interview?.feedback;
  const hasNoTranscription = !interview?.recordingTranscription;
  const isProcessing = !interview || hasNoFeedback || hasNoTranscription;

  if (isProcessing) {
    return <ProcessingState />;
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-6">
      <div className="relative mx-auto max-w-4xl space-y-6">
        <Link href="/" className="inline-block mb-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <HeaderCard mockInterviewId={mockInterviewId} />
        <PerformanceAnalysis mockInterviewId={mockInterviewId} />
        <ResponseAnalysis mockInterviewId={mockInterviewId} />
        <AnswerKey mockInterviewId={mockInterviewId} />
        <ReEvaluateButton mockInterviewId={mockInterviewId} />
      </div>
    </div>
  );
}
