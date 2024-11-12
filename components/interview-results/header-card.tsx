import { PlayCircle } from "lucide-react";
import { SectionCard } from "./shared/section-card";
import { prisma } from "@/lib/prisma";
import { CollapsibleTranscript } from "./collapsible-transcript";
import { CollapsibleMedia } from "./collapsible-media";

interface HeaderCardProps {
  mockInterviewId: string;
}

export async function HeaderCard({ mockInterviewId }: HeaderCardProps) {
  const interview = await prisma.mockInterview.findUnique({
    where: { id: mockInterviewId },
    include: { question: true },
  });

  if (!interview) return null;

  return (
    <SectionCard
      title="Your Response"
      subtitle="Review your response and transcript"
      icon={PlayCircle}
    >
      <div className="space-y-6">
        {/* Question */}
        <div className="rounded-xl border border-[#635BFF]/10 bg-gradient-to-br from-[#635BFF]/5 p-5">
          <h3 className="mb-3 font-medium text-[#635BFF]">Question</h3>
          <p className="text-sm leading-relaxed text-neutral-600">{interview.question.content}</p>
        </div>

        {/* Response Section */}
        <div className="space-y-4">
          {/* Video/Audio Player */}
          {(interview.videoUrl || interview.recordingUrl) && (
            <CollapsibleMedia videoUrl={interview.videoUrl} audioUrl={interview.recordingUrl} />
          )}

          {/* Transcript */}
          {interview.recordingTranscription && (
            <CollapsibleTranscript transcript={interview.recordingTranscription} />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
