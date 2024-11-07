import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { getTotalInterviews } from "@/lib/actions/getTotalInterviews";

export async function TotalInterviews() {
  const { total, thisWeek } = await getTotalInterviews();

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium text-neutral-500">Total Interviews</CardTitle>
        <History className="h-5 w-5 text-[#635BFF]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-neutral-900">{total}</div>
        <div className="flex items-center mt-1 text-sm text-[#635BFF]">
          <span>{thisWeek} this week</span>
        </div>
      </CardContent>
    </Card>
  );
}
