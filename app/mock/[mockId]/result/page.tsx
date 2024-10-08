import { notFound } from "next/navigation";
import { prisma } from "@/lib/apis/prisma";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

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

  return (
    <div className="container mx-auto p-4">
      <Link href={ROUTES.HOME}>
        <Button variant="outline">Home</Button>
      </Link>
      <h1 className="text-2xl font-bold">Mock Results:</h1>
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Question:</h2>
        <p className="text-lg">{question.content}</p>
      </div>
      {videoUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Video Recording:</h2>
          <video src={videoUrl} controls className="w-full max-w-2xl">
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      {transcription && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Transcription:</h2>
          <p className="text-lg">{transcription}</p>
        </div>
      )}
      {feedback && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Feedback:</h2>
          <MarkdownRenderer content={feedback.content} />
        </div>
      )}
    </div>
  );
}
