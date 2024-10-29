import { Suspense } from "react";
import { TotalInterviews } from "./TotalInterviews";
import { CurrentStreak } from "./CurrentStreak";
import { AverageScore } from "./AverageScore";
import { RecentInterviewScores } from "./RecentInterviewScores";
import { RecentPractice } from "./RecentPractice";
import { Skeleton } from "@/components/ui/skeleton";
import { StartInterviewButton } from "@/components/buttons/StartInterviewButton";
import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";

function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-lg bg-white border border-gray-100 shadow-sm h-[140px]">
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

function ChartCardSkeleton() {
  return (
    <div className="p-6 rounded-lg bg-white border border-gray-100 shadow-sm h-full min-h-[400px]">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Track your interview practice progress">
        <StartInterviewButton />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
        <Suspense fallback={<StatCardSkeleton />}>
          <TotalInterviews />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <CurrentStreak />
        </Suspense>
        <Suspense fallback={<StatCardSkeleton />}>
          <AverageScore />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <div className="md:col-span-2">
          <Suspense fallback={<ChartCardSkeleton />}>
            <RecentInterviewScores />
          </Suspense>
        </div>
        <Suspense fallback={<ChartCardSkeleton />}>
          <RecentPractice />
        </Suspense>
      </div>
    </PageContainer>
  );
}
