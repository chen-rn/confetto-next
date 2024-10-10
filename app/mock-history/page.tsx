import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/apis/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { PracticeHistory } from "@/components/practice-history";

export default async function MockHistoryPage() {
  const userId = auth().userId;

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  const mockInterviews = await prisma.mockInterview.findMany({
    where: { userId },
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Link href={ROUTES.HOME}>
            <Button variant="outline">Home</Button>
          </Link>
          <h1 className="text-3xl font-bold">Mock Interview History</h1>
          <div className="w-24" />
        </div>
        <p className="text-center text-gray-600">You haven't completed any mock interviews yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href={ROUTES.HOME}>
          <Button variant="outline">Home</Button>
        </Link>
        <h1 className="text-3xl font-bold">Mock Interview History</h1>
        <div className="w-24" />
      </div>
      <PracticeHistory mockInterviews={formattedMockInterviews} />
    </div>
  );
}
