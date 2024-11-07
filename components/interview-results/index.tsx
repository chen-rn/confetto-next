import { HeaderCard } from "./header-card";
import { PerformanceAnalysis } from "./performance-analysis";
import { ResponseAnalysis } from "./response-analysis";
import { AnswerKey } from "./answer-key";

export function InterviewResults({ mockInterviewId }: { mockInterviewId: string }) {
  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <HeaderCard question="How would you balance individual rights with community health responsibilities?" />

        <PerformanceAnalysis mockInterviewId={mockInterviewId} />

        <ResponseAnalysis mockInterviewId={mockInterviewId} />

        <AnswerKey mockInterviewId={mockInterviewId} />
      </div>
    </div>
  );
}
