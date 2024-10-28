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

// Update the interfaces to match Prisma types
interface MockInterview {
  id: string;
  question: {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    evaluationCriteria: string | null;
  };
  recordingUrl: string | null;
  createdAt: Date;
  feedback: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    overallScore: number;
    mockInterviewId: string;
    overallFeedback: string;
  } | null;
}

interface PracticeHistoryProps {
  mockInterviews: MockInterview[];
}

// Main component
export function PracticeHistory({ mockInterviews }: PracticeHistoryProps) {
  if (!mockInterviews.length) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Calendar className="h-12 w-12 text-gray-400" />
          <h3 className="font-semibold text-xl">No Practice Sessions Yet</h3>
          <p className="text-gray-500">Start your first mock interview to build your history.</p>
          <Link href={ROUTES.START_INTERVIEW}>
            <Button>Start Practice</Button>
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

// Separate component for the interview header
function InterviewHeader({ interview }: { interview: MockInterview }) {
  const formattedDate = new Date(interview.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  function getScoreBadgeVariant(
    score: number
  ): "default" | "destructive" | "outline" | "secondary" {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="w-20 h-14 rounded bg-gray-100 flex items-center justify-center">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-2 mb-1">{interview.question.content}</h3>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          {interview.feedback && (
            <Badge variant={getScoreBadgeVariant(interview.feedback.overallScore)}>
              {interview.feedback.overallScore}%
            </Badge>
          )}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
    </Card>
  );
}

// Separate component for feedback display
function FeedbackDisplay({ feedback }: { feedback: NonNullable<MockInterview["feedback"]> }) {
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
        <p className="text-sm text-gray-600">{feedback.overallFeedback}</p>
      </div>
    </div>
  );
}

// Separate component for the collapsible content
function CollapsibleInterviewContent({ interview }: { interview: MockInterview }) {
  return (
    <CollapsibleContent>
      <div className="mt-2 p-6 bg-gray-50 rounded-xl border">
        {interview.feedback ? (
          <>
            <FeedbackDisplay feedback={interview.feedback} />
            <div className="flex justify-end space-x-2 mt-6">
              <Link href={ROUTES.MOCK_RESULT(interview.id)}>
                <Button>View Detailed Feedback</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mb-4 text-gray-400" />
            <p className="mb-4 text-center">
              Your feedback is being processed.
              <br />
              Check back soon!
            </p>
            <Link href={ROUTES.MOCK_RESULT(interview.id)}>
              <Button variant="outline">View Recording</Button>
            </Link>
          </div>
        )}
      </div>
    </CollapsibleContent>
  );
}
