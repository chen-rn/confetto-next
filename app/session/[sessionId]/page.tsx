import MicButton from "@/components/MicButton";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import AudioPlayer from "@/components/AudioPlayer";

export default async function SessionPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;

  if (!sessionId) {
    notFound();
  }

  const practiceSession = await prisma.practiceSession.findUnique({
    where: { id: sessionId },
    include: { question: true, feedback: true },
  });

  if (!practiceSession || !practiceSession.question) {
    notFound();
  }

  const question = practiceSession.question.content;
  const feedback = practiceSession.feedback?.content;
  const transcription = practiceSession.recordingTranscription;
  const recordingUrl = practiceSession.recordingUrl;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Session Question:</h1>
      <p className="text-lg mb-6">{question}</p>
      <div className="mt-8">
        <MicButton sessionId={sessionId} />
      </div>
      {recordingUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Recording:</h2>
          <AudioPlayer src={recordingUrl} />
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
          <MarkdownRenderer content={feedback} />
        </div>
      )}
    </div>
  );
}
