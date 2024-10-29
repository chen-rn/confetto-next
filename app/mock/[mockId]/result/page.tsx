import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/app/mock/[mockId]/result/MarkdownRenderer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { processAudioSubmission } from "@/lib/actions/processAudioSubmission";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Loader2, RefreshCcw, Video, FileText, MessageSquare } from "lucide-react";
import { ProcessingMessage } from "@/app/mock/[mockId]/result/ProcessingMessage";
import { CollapsibleTranscription } from "@/app/mock/[mockId]/result/CollapsibleTranscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ResultPageProps {
  params: Promise<{
    mockId: string;
  }>;
}

export default async function ResultPage(props: ResultPageProps) {
  const params = await props.params;
  const { mockId } = params;

  if (!mockId) {
    notFound();
  }

  const mockInterview = await prisma.mockInterview.findUnique({
    where: { id: mockId },
    include: {
      feedback: true,
      question: {
        include: {
          tags: true,
        },
      },
    },
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

    processAudioSubmission(mockId);
    revalidatePath(`/mock/${mockId}/result`);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto py-4">
          <div className="flex items-center justify-between">
            <Link href={ROUTES.HOME}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <form action={handleReprocess}>
              <Button type="submit" variant="outline" size="sm" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Reprocess
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto p-6 space-y-6">
        {/* Question Section */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Interview Results</h1>
          <p className="text-neutral-500">Review your performance and get detailed feedback</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Question Details</CardTitle>
                <CardDescription>The scenario you responded to</CardDescription>
              </div>
              <div className="flex gap-2">
                {question.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{question.content}</p>
          </CardContent>
        </Card>

        {feedback ? (
          <Tabs defaultValue="feedback" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-2">
                <Video className="h-4 w-4" />
                Recording
              </TabsTrigger>
              <TabsTrigger value="transcript" className="gap-2">
                <FileText className="h-4 w-4" />
                Transcript
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Score</CardTitle>
                  <CardDescription>Based on your interview performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-6">
                    <div className="text-5xl font-bold text-primary">
                      {feedback.overallScore}/10
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div className="prose prose-neutral max-w-none">
                    <MarkdownRenderer content={feedback.overallFeedback} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="video">
              {videoUrl ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Recording</CardTitle>
                    <CardDescription>Review your performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video relative rounded-lg overflow-hidden bg-neutral-900">
                      <video src={videoUrl} controls className="w-full h-full">
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center h-64">
                  <CardContent>
                    <p className="text-neutral-500">No video recording available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="transcript">
              {transcription ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Transcript</CardTitle>
                    <CardDescription>Written record of your response</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CollapsibleTranscription transcription={transcription} />
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center h-64">
                  <CardContent>
                    <p className="text-neutral-500">No transcript available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <ProcessingMessage />
          </Card>
        )}
      </main>
    </div>
  );
}
