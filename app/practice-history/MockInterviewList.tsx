import { prisma } from "@/lib/apis/prisma";
import { PracticeHistory } from "@/components/PracticeHistory";

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
      feedback: {
        select: {
          ethicalPrinciplesUnderstanding: true,
          communicationSkills: true,
          professionalismAndEmpathy: true,
          legalAndMedicalLegislation: true,
          organizationAndStructure: true,
          overallScore: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedMockInterviews = mockInterviews.map((interview) => ({
    ...interview,
    feedback: interview.feedback || undefined,
  }));

  if (mockInterviews.length === 0) {
    return (
      <p className="text-center text-gray-600">You haven't completed any mock interviews yet.</p>
    );
  }

  return <PracticeHistory mockInterviews={formattedMockInterviews} />;
}
