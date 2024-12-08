import { HeaderCard } from "./header-card";
import { PerformanceAnalysis } from "./performance-analysis";
import { ResponseAnalysis } from "./response-analysis";
import { AnswerKey } from "./answer-key";
import { ProcessingState } from "./processing-state";
import { ReEvaluateButton } from "./re-evaluate-button";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InterviewResults({
  mockInterviewId,
  isProcessing,
}: {
  mockInterviewId: string;
  isProcessing: boolean;
}) {
  const homeButton = (
    <Link href="/" className="inline-block">
      <Button variant="ghost" size="sm" className="gap-2 transition-all hover:translate-x-[-2px]">
        <Home className="h-4 w-4" />
        Home
      </Button>
    </Link>
  );

  const NavigationBar = () => (
    <div className="flex justify-between items-center">
      {homeButton}
      <Link href="/mock-interview" className="inline-block">
        <Button variant="ghost" size="sm" className="gap-2 transition-all hover:translate-x-[2px]">
          Next question
          <span className="ml-2">→</span>
        </Button>
      </Link>
    </div>
  );

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-neutral-100 p-4 md:p-6">
        <div className="relative mx-auto max-w-4xl">
          <NavigationBar />
          <ProcessingState mockId={mockInterviewId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-6">
      <div className="relative mx-auto max-w-4xl space-y-6">
        <NavigationBar />
        <HeaderCard mockInterviewId={mockInterviewId} />
        <PerformanceAnalysis mockInterviewId={mockInterviewId} />
        <ResponseAnalysis mockInterviewId={mockInterviewId} />
        <AnswerKey mockInterviewId={mockInterviewId} />
        {/* <ReEvaluateButton mockInterviewId={mockInterviewId} /> */}
        <NavigationBar />
      </div>
    </div>
  );
}
