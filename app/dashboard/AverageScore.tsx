import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ChevronUp } from "lucide-react";
import { getAverageScore } from "@/lib/actions/getAverageScore";

export async function AverageScore() {
  const { average, difference } = await getAverageScore();

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium text-neutral-500">Average Score</CardTitle>
        <TrendingUp className="h-5 w-5 text-[#635BFF]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-neutral-900">{average}%</div>
        <div className="flex items-center mt-1 text-sm text-[#635BFF]">
          <ChevronUp className="h-4 w-4 mr-1" />
          <span>{difference}% from last week</span>
        </div>
      </CardContent>
    </Card>
  );
}
