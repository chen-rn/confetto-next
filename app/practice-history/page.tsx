import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { Suspense } from "react";
import { PracticeHistory } from "./PracticeHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";

function InterviewHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 bg-white rounded-xl border shadow-sm">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-20 h-14 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PracticeHistoryPage() {
  const { userId } = auth();

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
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
          evaluationCriteria: true,
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

  return (
    <PageContainer>
      <PageHeader title="Practice History" description="Review your past interview sessions" />

      <Suspense fallback={<InterviewHistorySkeleton />}>
        <PracticeHistory mockInterviews={mockInterviews} />
      </Suspense>
    </PageContainer>
  );
}
