import { HeaderCard } from "./header-card";
import { PerformanceAnalysis } from "./performance-analysis";
import { ResponseAnalysis } from "./response-analysis";
import { AnswerKey } from "./answer-key";
import { ProcessingState } from "./processing-state";
import { prisma } from "@/lib/prisma";
import { ReEvaluateButton } from "./re-evaluate-button";

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
  const isProcessing = hasRecording && hasNoFeedback;

  if (isProcessing) {
    return <ProcessingState />;
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-6">
      <div className="relative mx-auto max-w-4xl space-y-6">
        <HeaderCard mockInterviewId={mockInterviewId} />
        <PerformanceAnalysis mockInterviewId={mockInterviewId} />
        <ResponseAnalysis mockInterviewId={mockInterviewId} />
        <AnswerKey mockInterviewId={mockInterviewId} />
        <ReEvaluateButton mockInterviewId={mockInterviewId} />
      </div>
    </div>
  );
}
