import { Suspense } from "react";
import { TotalInterviews } from "../components/dashboard/TotalInterviews";
import { CurrentStreak } from "../components/dashboard/CurrentStreak";
import { AverageScore } from "../components/dashboard/AverageScore";
import { RecentInterviewScores } from "../components/dashboard/RecentInterviewScores";
import { UpcomingInterviews } from "../components/dashboard/UpcomingInterviews";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F7F9FC]">
      <div className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-semibold text-gray-900">Welcome back, Brotha</h1>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
            <Link href="/create-mock">Start Interview</Link>
          </Button>
        </div>
        <p className="text-gray-500 mb-6 text-sm">
          Here's an overview of your interview practice progress
        </p>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Suspense fallback={<div>Loading...</div>}>
              <TotalInterviews />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <CurrentStreak />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <AverageScore />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Suspense fallback={<div>Loading...</div>}>
              <RecentInterviewScores />
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <UpcomingInterviews />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
