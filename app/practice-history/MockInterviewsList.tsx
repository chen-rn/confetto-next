import { prisma } from "@/lib/prisma";
import { PracticeHistory } from "./PracticeHistory";
import { auth } from "@clerk/nextjs/server";

export async function MockInterviewsList() {
  const { userId } = auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const mockInterviews = await prisma.mockInterview.findMany({
    where: {
      userId,
      recordingUrl: {
        not: null,
      },
    },
    include: {
      question: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          tags: true,
        },
      },
      feedback: {
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          overallScore: true,
          mockInterviewId: true,
          overallFeedback: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Add status field to feedback objects
  const mockInterviewsWithStatus = mockInterviews.map((interview) => ({
    ...interview,
    feedback: interview.feedback
      ? {
          ...interview.feedback,
          status: "COMPLETED" as const, // Or whatever default status is appropriate
        }
      : null,
  }));

  return <PracticeHistory mockInterviews={mockInterviewsWithStatus} />;
}
