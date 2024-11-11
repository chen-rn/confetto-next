import { BarChart2, TrendingUp, MessageCircle, Award, Target } from "lucide-react";
import { CircularProgress } from "./circular-progress";
import { ComponentSection } from "./component-section";
import { SectionCard } from "./shared/section-card";
import { prisma } from "@/lib/prisma";

interface ComponentScore {
  name: string;
  score: number;
  total: number;
  summary: string;
}

interface PerformanceAnalysisProps {
  mockInterviewId: string;
}

const FEEDBACK_TYPES = {
  exceptional: {
    text: "Exceptional",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Award,
  },
  excellent: {
    text: "Excellent",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Award,
  },
  good: {
    text: "Good",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: TrendingUp,
  },
  fair: {
    text: "Fair",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: MessageCircle,
  },
  needsImprovement: {
    text: "Needs Improvement",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: MessageCircle,
  },
} as const;

function getFeedbackVariant(score: number): "default" | "blue" | "purple" | "success" {
  if (score >= 90) return "purple";
  if (score >= 80) return "success";
  if (score >= 70) return "blue";
  return "default";
}

export async function PerformanceAnalysis({ mockInterviewId }: PerformanceAnalysisProps) {
  const feedback = await prisma.feedback.findUnique({
    where: { mockInterviewId },
    include: {
      componentScores: true,
    },
  });

  if (!feedback) {
    return null;
  }

  const scorePercentage = feedback.overallScore;
  const grade = getGrade(scorePercentage);
  const summary = feedback.overallFeedback;

  const components = feedback.componentScores.map((component) => ({
    name: component.name,
    score: component.score,
    total: component.maxPoints,
    summary: component.summary,
  }));

  const getFeedbackType = (score: number) => {
    if (score >= 90) return FEEDBACK_TYPES.exceptional;
    if (score >= 80) return FEEDBACK_TYPES.excellent;
    if (score >= 70) return FEEDBACK_TYPES.good;
    if (score >= 60) return FEEDBACK_TYPES.fair;
    return FEEDBACK_TYPES.needsImprovement;
  };

  const feedbackType = getFeedbackType(scorePercentage);

  return (
    <SectionCard
      title="Performance Analysis"
      subtitle="Detailed breakdown of your interview performance"
      icon={BarChart2}
      badge={{
        label: feedbackType.text,
        icon: feedbackType.icon,
        variant: getFeedbackVariant(scorePercentage),
      }}
    >
      <div className="grid gap-10 md:grid-cols-5">
        {/* Left Column - Score Overview */}
        <div className="space-y-8 md:col-span-2">
          <div>
            <h2 className="text-xl font-semibold text-[#635BFF]">Overall Performance</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Grade {grade} Performance Level
            </p>
          </div>

          <div className="flex justify-center py-2">
            <CircularProgress percentage={scorePercentage} grade={grade} />
          </div>

          <div className="rounded-xl border border-[#635BFF]/10 bg-gradient-to-br from-[#635BFF]/5 p-5">
            <div className="mb-3 flex items-center gap-2 font-medium text-[#635BFF]">
              <MessageCircle className="h-4 w-4" />
              Key Observations
            </div>
            <p className="text-sm leading-relaxed text-neutral-600">{summary}</p>
          </div>
        </div>

        {/* Right Column - Component Breakdown */}
        <div className="md:col-span-3">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <h3 className="flex items-center gap-2 font-semibold text-[#635BFF]">
              <Target className="h-4 w-4" />
              Component Analysis
            </h3>
            <span className="text-xs text-muted-foreground">Click sections to expand</span>
          </div>

          <div className="space-y-4">
            {components.map((component) => (
              <ComponentSection key={component.name} component={component} />
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
function getGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "F";
  return "F";
}
