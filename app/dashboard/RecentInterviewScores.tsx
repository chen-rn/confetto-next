import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { InterviewScoresChart } from "./InterviewScoresChart";

async function getDailyAverageScores() {
  const { userId } = auth();
  if (!userId) return [];

  const interviews = await prisma.mockInterview.findMany({
    where: {
      userId,
      feedback: {
        isNot: null,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      feedback: {
        select: {
          overallScore: true,
        },
      },
    },
  });

  // Group interviews by date and calculate average
  const dailyScores = interviews.reduce((acc, interview) => {
    const date = new Date(interview.createdAt).toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = {
        totalScore: 0,
        count: 0,
      };
    }

    if (interview.feedback?.overallScore) {
      acc[date].totalScore += interview.feedback.overallScore;
      acc[date].count += 1;
    }

    return acc;
  }, {} as Record<string, { totalScore: number; count: number }>);

  // Convert to array of daily averages
  return Object.entries(dailyScores).map(([date, { totalScore, count }]) => ({
    date,
    score: Math.round(totalScore / count),
  }));
}

export async function RecentInterviewScores() {
  const dailyScores = await getDailyAverageScores();

  return (
    <Card className="md:col-span-2 bg-white border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Daily Average Scores</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[300px] h-full">
        <InterviewScoresChart scores={dailyScores} />
      </CardContent>
    </Card>
  );
}
