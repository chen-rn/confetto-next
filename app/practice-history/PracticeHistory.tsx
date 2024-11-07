"use client";

import React from "react";
import { Clock, Award, ChevronDown, FileText, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MockInterview, Question, QuestionTag, Feedback } from "@prisma/client";

interface PracticeHistoryProps {
  mockInterviews: (MockInterview & {
    question: Question & {
      tags: QuestionTag[];
    };
    feedback: Feedback | null;
  })[];
}

// Main component
export function PracticeHistory({ mockInterviews }: PracticeHistoryProps) {
  if (!mockInterviews.length) {
    return (
      <Card className="py-10 text-center bg-white border shadow-sm rounded-3xl">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#635BFF]/5 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-[#635BFF]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-xl text-neutral-900">No Practice Sessions Yet</h3>
            <p className="text-neutral-500 text-sm">
              Start your first mock interview to build your history and track your progress.
            </p>
          </div>
          <Link href={ROUTES.START_INTERVIEW}>
            <Button className="bg-[#635BFF] hover:bg-[#635BFF]/90 rounded-lg">
              Start Practice
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {mockInterviews.map((interview) => (
        <Collapsible key={interview.id}>
          <InterviewHeader interview={interview} />
          <CollapsibleInterviewContent interview={interview} />
        </Collapsible>
      ))}
    </div>
  );
}

type InterviewWithRelations = MockInterview & {
  question: Question & {
    tags: QuestionTag[];
  };
  feedback: Feedback | null;
};

// Separate component for the interview header
function InterviewHeader({ interview }: { interview: InterviewWithRelations }) {
  const formattedDate = new Date(interview.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function getScoreBadgeVariant(score: number) {
    if (score >= 80) return "bg-emerald-100 text-emerald-700";
    if (score >= 60) return "bg-amber-100 text-amber-700";
    return "bg-rose-100 text-rose-700";
  }

  return (
    <div className="group rounded-xl border border-neutral-200 bg-white transition-all duration-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="w-16 h-14 rounded bg-[#635BFF]/5 flex items-center justify-center">
            <FileText className="h-6 w-6 text-[#635BFF]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm text-neutral-700 line-clamp-2 mb-2">
              {interview.question.content}
            </h3>
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <div className="flex items-center">
                <Clock className="mr-1.5 h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {interview.question.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className={cn(
                      "border-transparent rounded-lg text-xs py-0.5",
                      tag.type === "TOPIC" && "bg-blue-100 text-blue-700",
                      tag.type === "STATE" && "bg-purple-100 text-purple-700",
                      tag.type === "COUNTRY" && "bg-rose-100 text-rose-700"
                    )}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          {interview.feedback && (
            <Badge
              variant="secondary"
              className={cn(
                "border-transparent rounded-lg font-medium",
                getScoreBadgeVariant(interview.feedback.overallScore)
              )}
            >
              {interview.feedback.overallScore}%
            </Badge>
          )}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
    </div>
  );
}

// Separate component for feedback display
function FeedbackDisplay({ feedback }: { feedback: Feedback }) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h4 className="font-medium mb-2">Overall Score</h4>
        <Progress
          value={feedback.overallScore}
          className="h-2"
          indicatorClassName={cn(
            feedback.overallScore >= 80 && "bg-green-500",
            feedback.overallScore >= 60 && feedback.overallScore < 80 && "bg-yellow-500",
            feedback.overallScore < 60 && "bg-red-500"
          )}
        />
        <span className="text-xs text-muted-foreground mt-1">{feedback.overallScore}%</span>
      </div>
      <div className="mt-4">
        <h4 className="font-medium mb-2">Feedback</h4>
        <p className="text-sm text-neutral-600">{feedback.overallFeedback}</p>
      </div>
    </div>
  );
}

// Separate component for the collapsible content
function CollapsibleInterviewContent({ interview }: { interview: InterviewWithRelations }) {
  return (
    <CollapsibleContent>
      <div className="mt-2 p-6 rounded-xl border border-neutral-100 bg-white">
        {interview.feedback ? (
          <>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-3">Overall Score</h4>
                <div className="space-y-2">
                  <Progress
                    value={interview.feedback.overallScore}
                    className="h-2"
                    indicatorClassName={cn(
                      "transition-all",
                      interview.feedback.overallScore >= 80 && "bg-emerald-500",
                      interview.feedback.overallScore >= 60 &&
                        interview.feedback.overallScore < 80 &&
                        "bg-amber-500",
                      interview.feedback.overallScore < 60 && "bg-rose-500"
                    )}
                  />
                  <span className="text-sm text-neutral-500">
                    {interview.feedback.overallScore}% Score
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-3">Feedback</h4>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {interview.feedback.overallFeedback}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Link href={ROUTES.MOCK_RESULT(interview.id)}>
                <Button className="bg-[#635BFF] hover:bg-[#635BFF]/90 rounded-lg">
                  View Detailed Feedback
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#635BFF]/5 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-[#635BFF]" />
            </div>
            <p className="text-neutral-600 text-center mb-4">
              Your feedback is being processed.
              <br />
              Check back soon!
            </p>
            <Link href={ROUTES.MOCK_RESULT(interview.id)}>
              <Button
                variant="outline"
                className="border-[#635BFF] text-[#635BFF] hover:bg-[#635BFF]/5"
              >
                View Recording
              </Button>
            </Link>
          </div>
        )}
      </div>
    </CollapsibleContent>
  );
}
