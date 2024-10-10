import { notFound } from "next/navigation";
import { prisma } from "@/lib/apis/prisma";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { processAudioSubmission } from "@/lib/actions/processAudioSubmission";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { Loader2 } from "lucide-react";

interface ResultPageProps {
  params: {
    mockId: string;
  };
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { mockId } = params;

  if (!mockId) {
    notFound();
  }

  const mockInterview = await prisma.mockInterview.findUnique({
    where: { id: mockId },
    include: { feedback: true, question: true },
  });

  if (!mockInterview || !mockInterview.question) {
    notFound();
  }

  const { feedback, videoUrl, recordingTranscription: transcription, question } = mockInterview;

  async function handleReprocess() {
    "use server";

    const latestMockInterview = await prisma.mockInterview.findUnique({
      where: { id: mockId },
      include: { feedback: true },
    });

    if (latestMockInterview?.feedback?.id) {
      await prisma.feedback.delete({
        where: { id: latestMockInterview.feedback.id },
      });
    }

    await processAudioSubmission(mockId);
    revalidatePath(`/mock/${mockId}/result`);
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link href={ROUTES.HOME}>
          <Button variant="outline">Home</Button>
        </Link>
        <h1 className="text-2xl font-bold text-center flex-grow">Mock Interview Results</h1>
        <div className="w-24" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base">{question.content}</p>
        </CardContent>
      </Card>

      {videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Video Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <video src={videoUrl} controls className="w-full rounded-md">
              Your browser does not support the video tag.
            </video>
          </CardContent>
        </Card>
      )}

      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle>Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{transcription}</p>
          </CardContent>
        </Card>
      )}

      {feedback ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Score: {feedback.overallScore}/100</h3>
                <p className="text-base">{feedback.overallFeedback}</p>
              </div>
              <MarkdownRenderer content={feedback.rawContent} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackSection
                title="Ethical Principles Understanding"
                score={feedback.ethicalPrinciplesUnderstanding}
                feedback={feedback.ethicalPrinciplesFeedback}
              />
              <FeedbackSection
                title="Communication Skills"
                score={feedback.communicationSkills}
                feedback={feedback.communicationSkillsFeedback}
              />
              <FeedbackSection
                title="Professionalism and Empathy"
                score={feedback.professionalismAndEmpathy}
                feedback={feedback.professionalismAndEmpathyFeedback}
              />
              <FeedbackSection
                title="Legal and Medical Legislation"
                score={feedback.legalAndMedicalLegislation}
                feedback={feedback.legalAndMedicalLegislationFeedback}
              />
              <FeedbackSection
                title="Organization and Structure"
                score={feedback.organizationAndStructure}
                feedback={feedback.organizationAndStructureFeedback}
              />
            </CardContent>
          </Card>

          <form action={handleReprocess} className="flex justify-center">
            <Button type="submit" variant="default">
              Reprocess Submission
            </Button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-gray-600">Processing your submission...</p>
          <form action={handleReprocess} className="mt-4">
            <Button type="submit" variant="default">
              Reprocess Submission
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

interface FeedbackSectionProps {
  title: string;
  score: number;
  feedback: string;
}

function FeedbackSection({ title, score, feedback }: FeedbackSectionProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-base">Score: {score}/20</p>
      <p className="text-base">{feedback}</p>
    </div>
  );
}
