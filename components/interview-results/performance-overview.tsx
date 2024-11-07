import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, TrendingUp, MessageCircle, Award } from "lucide-react";
import { CircularProgress } from "./circular-progress";
import { cn } from "@/lib/utils";

interface FeedbackType {
  text: string;
  color: string;
  icon: React.ReactNode;
}

interface PerformanceOverviewProps {
  scorePercentage: number;
  grade: string;
  summary: string;
}

const FEEDBACK_TYPES: Record<string, FeedbackType> = {
  exceptional: {
    text: "Exceptional",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Award className="h-4 w-4 text-purple-600" />,
  },
  excellent: {
    text: "Excellent",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <Award className="h-4 w-4 text-green-600" />,
  },
  good: {
    text: "Good",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
  },
  fair: {
    text: "Fair",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <MessageCircle className="h-4 w-4 text-orange-600" />,
  },
  needsImprovement: {
    text: "Needs Improvement",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <MessageCircle className="h-4 w-4 text-amber-600" />,
  },
} as const;

export function PerformanceOverview({ scorePercentage, grade, summary }: PerformanceOverviewProps) {
  const getFeedbackType = (score: number): FeedbackType => {
    if (score >= 90) return FEEDBACK_TYPES.exceptional;
    if (score >= 80) return FEEDBACK_TYPES.excellent;
    if (score >= 70) return FEEDBACK_TYPES.good;
    if (score >= 60) return FEEDBACK_TYPES.fair;
    return FEEDBACK_TYPES.needsImprovement;
  };

  const feedback = getFeedbackType(scorePercentage);

  return (
    <Card className="group overflow-hidden rounded-xl border-[#635BFF]/10 shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-[#635BFF]/5">
      <CardHeader className="border-b border-neutral-200 bg-gradient-to-r from-[#635BFF]/10 via-[#635BFF]/5 to-transparent p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <BarChart2 className="h-5 w-5 text-[#635BFF] transition-transform group-hover:scale-110" />
            Performance Overview
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("transition-all duration-300 group-hover:scale-105", feedback.color)}
          >
            {feedback.icon}
            <span className="ml-1">{feedback.text}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="bg-gradient-to-r from-[#635BFF] to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                Overall Score
              </h2>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Based on {grade} grade performance
              </p>
            </div>

            <div className="rounded-lg border border-[#635BFF]/10 bg-gradient-to-r from-[#635BFF]/5 to-transparent p-5">
              <div className="mb-3 flex items-center justify-between border-b border-[#635BFF]/10 pb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[#635BFF]" />
                  <span className="font-medium">Key Feedback</span>
                </div>
                <span className="text-sm text-muted-foreground">Score: {scorePercentage}%</span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed first-letter:text-lg first-letter:font-medium">
                {summary}
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-[#635BFF]/5 via-transparent to-[#635BFF]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="transition-transform duration-300 group-hover:scale-105">
              <CircularProgress percentage={scorePercentage} grade={grade} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
