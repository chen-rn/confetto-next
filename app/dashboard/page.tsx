import { Suspense } from "react";
import { TotalInterviews } from "../../components/dashboard/TotalInterviews";
import { CurrentStreak } from "../../components/dashboard/CurrentStreak";
import { AverageScore } from "../../components/dashboard/AverageScore";
import { RecentInterviewScores } from "../../components/dashboard/RecentInterviewScores";
import { UpcomingInterviews } from "../../components/dashboard/UpcomingInterviews";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-lg bg-white shadow h-[140px]">
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
    <div className="p-6 rounded-lg bg-white shadow h-[400px]">
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

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F7F9FC]">
      <div className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-900">Welcome back, Brotha</h1>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
            <Link href={ROUTES.QUESTION_BANK}>Start Interview</Link>
          </Button>
        </div>
        <p className="text-gray-500 mb-6 text-sm">
          Here's an overview of your interview practice progress
        </p>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Suspense fallback={<ChartCardSkeleton />}>
              <RecentInterviewScores />
            </Suspense>
            <Suspense fallback={<ChartCardSkeleton />}>
              <UpcomingInterviews />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
