import { BookOpen, Brain, LightbulbIcon, LayoutTemplate, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SectionCard } from "./shared/section-card";
import { prisma } from "@/lib/prisma";
import type { KeyInsight } from "@prisma/client";

interface HighlightedTextProps {
  content: string;
  highlightedSections: Array<{
    text: string;
    insight: string;
    explanation: string;
  }>;
}

function HighlightedText({ content, highlightedSections }: HighlightedTextProps) {
  let currentText = content;
  const elements: JSX.Element[] = [];

  highlightedSections.forEach((section, index) => {
    const parts = currentText.split(section.text);
    if (parts.length > 1) {
      elements.push(<span key={`text-${index}`}>{parts[0]}</span>);
      elements.push(
        <TooltipProvider key={`highlight-${index}`}>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="cursor-help bg-yellow-400/20 hover:bg-yellow-400/20 px-1 py-0.5 rounded transition-colors">
                {section.text}
              </span>
            </TooltipTrigger>
            <TooltipContent className="flex w-64 flex-col gap-1 p-3" side="top" sideOffset={5}>
              <span className="font-medium text-yellow-700">{section.insight}</span>
              <span className="text-sm text-neutral-500">{section.explanation}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      currentText = parts[1];
    }
  });

  elements.push(<span key="remaining">{currentText}</span>);

  return <>{elements}</>;
}

interface AnswerKeyProps {
  mockInterviewId: string;
}

export async function AnswerKey({ mockInterviewId }: AnswerKeyProps) {
  const mockInterview = await prisma.mockInterview.findUnique({
    where: { id: mockInterviewId },
    include: {
      question: {
        include: {
          answerKey: {
            include: {
              keyInsights: true,
              answerStructure: true,
              highlightedPoints: true,
            },
          },
        },
      },
    },
  });

  if (!mockInterview?.question.answerKey) return null;

  const { answerKey } = mockInterview.question;
  const question = mockInterview.question.content;

  return (
    <SectionCard
      title="Answer Key"
      subtitle="Expert approach and model answer"
      icon={BookOpen}
      badge={{
        label: "Expert Guide",
        icon: Brain,
        variant: "blue",
      }}
    >
      <div className="animate-in slide-in-from-top duration-300 divide-y divide-neutral-100/60">
        <div className="space-y-4">
          {/* Question Restatement */}
          <div className="pt-2 pb-6">
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
              <h3 className="mb-2 font-medium text-neutral-700">Question</h3>
              <p className="text-sm text-neutral-600">{question}</p>
            </div>
          </div>

          {/* Key Insights */}
          <div className="pb-6">
            <div className="mb-4 flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-[#635BFF]" />
              <h3 className="font-semibold">Key Insights</h3>
            </div>
            <div className="grid gap-3.5">
              {answerKey.keyInsights.map((insight: KeyInsight, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-[#635BFF]/10 bg-[#635BFF]/5 p-3.5"
                >
                  <h4 className="mb-1 text-sm font-medium text-[#635BFF]">{insight.title}</h4>
                  <p className="text-sm text-neutral-700">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Structure */}
          <div className="pb-6">
            <div className="mb-4 flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-[#635BFF]" />
              <h3 className="font-semibold">Answer Structure</h3>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white p-4">
              <div className="grid gap-3">
                {answerKey.answerStructure.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 relative pl-8">
                    <span className="absolute left-0 top-0 text-sm font-medium text-[#635BFF]">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.section}</h4>
                      <p className="text-xs text-neutral-600">{item.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Answer */}
          <div className="rounded-xl border border-[#635BFF]/10 bg-[#635BFF]/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#635BFF]" />
                <h3 className="font-semibold">Model Answer</h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs border border-neutral-200">
                <div className="h-1 w-3 rounded bg-yellow-400/30"></div>
                <span className="text-neutral-600">Hover over highlighted text for insights</span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none rounded-lg bg-white/80 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                <HighlightedText
                  content={answerKey.modelAnswer}
                  highlightedSections={answerKey.highlightedPoints.map((point) => ({
                    text: point.text,
                    insight: point.insight,
                    explanation: point.explanation,
                  }))}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
