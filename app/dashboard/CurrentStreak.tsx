import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { getCurrentStreak } from "@/lib/actions/getCurrentStreak";

export async function CurrentStreak() {
  const streak = await getCurrentStreak();

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium text-gray-500">Current Streak</CardTitle>
        <Flame className="h-5 w-5 text-[#635BFF]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-gray-900">{streak} days</div>
        <div className="flex items-center mt-1 text-sm text-[#635BFF]">
          <span>Keep it up!</span>
        </div>
      </CardContent>
    </Card>
  );
}
