import { prisma } from "@/lib/prisma";
import { InterviewResults } from "@/components/interview-results";

export default async function ResultPage({ params }: { params: { mockId: string } }) {
  const interview = await prisma.mockInterview.findUnique({
    where: { id: params.mockId },
    select: {
      recordingUrl: true,
      videoUrl: true,
      recordingTranscription: true,
      feedback: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  const hasNoFeedback = !interview?.feedback;
  const hasNoTranscription = !interview?.recordingTranscription;
  const isProcessing =
    !interview ||
    hasNoFeedback ||
    hasNoTranscription ||
    interview.feedback?.status === "PROCESSING" ||
    interview.feedback?.status === "PENDING";

  return <InterviewResults isProcessing={isProcessing} mockInterviewId={params.mockId} />;
}
