"use client";

import React from "react";
import { Clock, Award, ThumbsUp, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

// Move the interface to a separate types file if it's used in multiple components
interface MockInterview {
  id: string;
  question: { content: string };
  recordingUrl: string | null;
  createdAt: Date;
  feedback?: {
    ethicalPrinciplesUnderstanding: number;
    communicationSkills: number;
    professionalismAndEmpathy: number;
    legalAndMedicalLegislation: number;
    organizationAndStructure: number;
    overallScore: number;
  };
}

interface PracticeHistoryProps {
  mockInterviews: MockInterview[];
}

// Separate component for the interview header
function InterviewHeader({ interview }: { interview: MockInterview }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <img
          src="https://i.imgur.com/3Xcehfn.jpeg"
          alt="Session thumbnail"
          className="w-20 h-14 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium line-clamp-2">{interview.question.content}</h3>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Clock className="mr-1 h-3 w-3" />
            <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 flex-shrink-0">
        {interview.feedback && (
          <div className="flex items-center p-2 shrink-0">
            <Award className="mr-1 h-4 w-4 text-yellow-500" />
            <span className="font-bold">{interview.feedback.overallScore}</span>
          </div>
        )}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2 shrink-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
    </div>
  );
}

// Separate component for feedback display
function FeedbackDisplay({ feedback }: { feedback: NonNullable<MockInterview["feedback"]> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
      {Object.entries(feedback).map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-xs font-medium mb-1">
            {key
              .replace(/([A-Z])/g, " $1")
              .trim()
              .replace(/^\w/, (c) => c.toUpperCase())}
          </span>
          <Progress value={value} className="h-2 border" />
          <span className="text-xs text-muted-foreground mt-1">{value}%</span>
        </div>
      ))}
    </div>
  );
}

// Separate component for the collapsible content
function CollapsibleInterviewContent({ interview }: { interview: MockInterview }) {
  return (
    <CollapsibleContent>
      <div className="mt-2 mb-4 p-4 bg-neutral-50 rounded-xl">
        {interview.feedback ? (
          <>
            <FeedbackDisplay feedback={interview.feedback} />
            <div className="flex justify-end space-x-2 mt-4">
              <Link href={ROUTES.MOCK_RESULT(interview.id)}>
                <Button size="sm" variant="outline" className="text-xs">
                  <FileText className="mr-1 h-3 w-3" />
                  View Detail
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            Feedback not available for this interview.
          </div>
        )}
      </div>
    </CollapsibleContent>
  );
}

// Main component
export function PracticeHistory({ mockInterviews }: PracticeHistoryProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        {mockInterviews.map((interview) => (
          <Collapsible key={interview.id}>
            <InterviewHeader interview={interview} />
            <CollapsibleInterviewContent interview={interview} />
          </Collapsible>
        ))}
      </div>
    </div>
  );
}