"use client";

import { Video, Mic, FileText, PlayCircle } from "lucide-react";
import { SectionCard } from "./shared/section-card";
import { useQuery } from "@tanstack/react-query";
import { getMockInterview } from "@/lib/actions/getMockInterview";

interface HeaderCardProps {
  mockInterviewId: string;
}

export function HeaderCard({ mockInterviewId }: HeaderCardProps) {
  const { data: interview } = useQuery({
    queryKey: ["mockInterview", mockInterviewId],
    queryFn: () => getMockInterview(mockInterviewId),
  });

  if (!interview) return null;

  return (
    <SectionCard
      title="Interview Question"
      subtitle="Review your response and transcript"
      icon={PlayCircle}
    >
      <div className="space-y-6">
        {/* Question */}
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
          <h3 className="mb-2 font-medium text-neutral-700">Question</h3>
          <p className="text-sm text-neutral-600">{interview.question.content}</p>
        </div>

        {/* Video/Audio Player */}
        {(interview.videoUrl || interview.recordingUrl) && (
          <div className="rounded-xl border border-[#635BFF]/10 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              {interview.videoUrl ? (
                <Video className="h-5 w-5 text-[#635BFF]" />
              ) : (
                <Mic className="h-5 w-5 text-[#635BFF]" />
              )}
              <h3 className="font-semibold">Your Response</h3>
            </div>
            {interview.videoUrl ? (
              <video src={interview.videoUrl} controls className="w-full rounded-lg" />
            ) : (
              <audio src={interview.recordingUrl!} controls className="w-full" />
            )}
          </div>
        )}

        {/* Transcript */}
        {interview.recordingTranscription && (
          <div className="rounded-xl border border-[#635BFF]/10 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#635BFF]" />
              <h3 className="font-semibold">Response Transcript</h3>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
              {interview.recordingTranscription}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}