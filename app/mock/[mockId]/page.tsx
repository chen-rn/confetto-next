import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/apis/prisma";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Video, Send, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InterviewActionButton } from "@/components/InterviewActionButton";
import { VideoViewfinder } from "@/components/VideoViewfinder";

import { getLivekitRoomToken } from "@/lib/actions/getLivekitRoomToken";
import { InterviewRoom } from "@/components/InterviewRoom";

interface MMIInterviewInterfaceProps {
  params: {
    mockId: string;
  };
}

export default async function MMIInterviewInterface({ params }: MMIInterviewInterfaceProps) {
  const { mockId } = params;

  if (!mockId) {
    notFound();
  }

  const mockInterview = await prisma.mockInterview.findUnique({
    where: { id: mockId },
    include: { question: true },
  });

  if (!mockInterview || !mockInterview.question) {
    notFound();
  }

  if (mockInterview.recordingUrl) {
    redirect(ROUTES.MOCK_RESULT(mockId));
  }

  const { question } = mockInterview;

  // Get LiveKit room token
  const { accessToken } = await getLivekitRoomToken(question.content);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href={ROUTES.HOME}>
              <Button variant="ghost" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              MMI Station: Ethics Scenario
            </h1>
            <span className="bg-[#635BFF] text-white px-2 py-1 rounded-full text-xs font-medium tracking-wide">
              Premium
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Mic className="h-5 w-5 text-gray-500" />
            </Button>
            <Button variant="default" size="icon">
              <Video className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full max-w-7xl mx-auto">
          {/* Video Feed */}
          <div className="w-2/3 p-4 relative">
            <InterviewRoom token={accessToken} question={question.content} />
            {/* <div className="absolute bottom-8 right-8">
              <VideoViewfinder />
            </div> */}
          </div>

          {/* Transcript and Co-pilot */}
          <div className="w-1/3 p-4 flex flex-col">
            <Card className="flex-1 mb-4 overflow-auto">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2 text-lg tracking-tight">Question:</h2>
                <p className="text-sm leading-relaxed">{question.content}</p>
              </CardContent>
            </Card>
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader className="bg-white text-gray-900 py-2 flex justify-between items-center">
                <CardTitle className="text-lg flex items-center font-semibold tracking-tight">
                  Interview Co-pilot
                  <span className="ml-2 flex items-center bg-white border border-green-500 rounded-full px-2 py-0.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-xs text-green-500 font-medium tracking-wide">Ready</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-auto">
                {/* Co-pilot content */}
              </CardContent>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask for advice or clarification..."
                    className="flex-1 text-sm"
                  />
                  <Button size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-end items-center max-w-7xl mx-auto">
          <InterviewActionButton mockId={mockId} />
        </div>
      </footer>
    </div>
  );
}
