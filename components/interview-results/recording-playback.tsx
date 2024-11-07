"use client";

import { Video, Mic, FileText } from "lucide-react";
import { SectionCard } from "./shared/section-card";
import { useQuery } from "@tanstack/react-query";
import { getMockInterview } from "@/lib/actions/getMockInterview";

interface RecordingPlaybackProps {
  mockInterviewId: string;
}

export function RecordingPlayback({ mockInterviewId }: RecordingPlaybackProps) {
  const { data: interview } = useQuery({
    queryKey: ["mockInterview", mockInterviewId],
    queryFn: () => getMockInterview(mockInterviewId),
  });

  if (!interview) return null;

  return (
    <SectionCard
      title="Your Response"
      subtitle="Review your recorded response and transcript"
      icon={Mic}
    >
      <div className="space-y-6">
        {/* Video/Audio Player */}
        {(interview.videoUrl || interview.recordingUrl) && (
          <div className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              {interview.videoUrl ? (
                <Video className="h-5 w-5 text-[#635BFF]" />
              ) : (
                <Mic className="h-5 w-5 text-[#635BFF]" />
              )}
              <h3 className="font-semibold">Recording</h3>
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
          <div className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#635BFF]" />
              <h3 className="font-semibold">Transcript</h3>
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
