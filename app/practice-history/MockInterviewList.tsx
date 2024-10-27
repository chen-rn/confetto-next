import { prisma } from "@/lib/prisma";
import { PracticeHistory } from "@/app/practice-history/PracticeHistory";

interface MockInterviewListProps {
  userId: string;
}

export async function MockInterviewList({ userId }: MockInterviewListProps) {
  const mockInterviews = await prisma.mockInterview.findMany({
    where: {
      userId,
      recordingUrl: { not: null },
    },
    select: {
      id: true,
      question: { select: { content: true } },
      recordingUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedMockInterviews = mockInterviews.map((interview) => ({
    ...interview,
  }));

  if (mockInterviews.length === 0) {
    return (
      <p className="text-center text-gray-600">You haven't completed any mock interviews yet.</p>
    );
  }

  return <PracticeHistory mockInterviews={formattedMockInterviews} />;
}
