import { Suspense } from "react";
import { TotalInterviews } from "./TotalInterviews";
import { CurrentStreak } from "./CurrentStreak";
import { AverageScore } from "./AverageScore";
import { RecentInterviewScores } from "./RecentInterviewScores";
import { UpcomingInterviews } from "./UpcomingInterviews";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StartInterviewButton } from "@/components/buttons/StartInterviewButton";

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
    <div className="p-6 rounded-lg bg-white border border-gray-100 shadow-sm h-[400px]">
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
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen bg-neutral-100">
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome back, Brotha</h1>
          <StartInterviewButton user={user} />
        </div>
        <p className="text-gray-400 mb-8 text-sm">
          Here's an overview of your interview practice progress
        </p>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
