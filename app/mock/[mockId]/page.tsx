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
    include: {
      question: {
        include: {
          tags: true, // Include the tags relation
        },
      },
    },
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

  // Get the question type from the tags
  const questionType =
    mockInterview.question.tags.find((tag) => tag.type === "TOPIC")?.name || "Ethics";

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <main className="flex-1 overflow-hidden">
        <InterviewRoom
          token={accessToken}
          question={question.content}
          mockId={mockId}
          questionType={questionType}
        />
      </main>
    </div>
  );
}
