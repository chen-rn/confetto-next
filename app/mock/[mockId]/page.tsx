import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { InterviewRoom } from "@/app/mock/[mockId]/InterviewRoom";

import { getLivekitRoomToken } from "@/lib/actions/getLivekitRoomToken";

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
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              MMI Station: Ethics Scenario
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Video Feed */}
        <InterviewRoom token={accessToken} question={question.content} mockId={mockId} />
      </main>
    </div>
  );
}
