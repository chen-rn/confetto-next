import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentScores } from "@/lib/actions/getRecentScores";
import { InterviewScoresChart } from "./InterviewScoresChart";

export async function RecentInterviewScores() {
  const recentScores = await getRecentScores();

  return (
    <Card className="md:col-span-2 bg-white border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Recent Interview Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <InterviewScoresChart scores={recentScores} />
      </CardContent>
    </Card>
  );
}
