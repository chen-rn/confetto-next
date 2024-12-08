import { cn } from "@/lib/utils";

interface CircularProgressProps {
  percentage: number;
  grade: string;
  className?: string;
}

function getScoreColorClasses(percentage: number): { stroke: string; text: string } {
  if (percentage > 85) {
    return { stroke: "stroke-green-500", text: "text-green-500" };
  } else if (percentage >= 70) {
    return { stroke: "stroke-yellow-500", text: "text-yellow-500" };
  } else if (percentage >= 50) {
    return { stroke: "stroke-gray-500", text: "text-gray-500" };
  } else {
    return { stroke: "stroke-red-500", text: "text-red-500" };
  }
}

export function CircularProgress({ percentage, grade, className }: CircularProgressProps) {
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const colorClasses = getScoreColorClasses(percentage);

  return (
    <div className={cn("relative h-48 w-48", className)}>
      <svg className="h-full w-full -rotate-90 transform">
        {/* Background circle */}
        <circle
          className="stroke-neutral-100"
          fill="none"
          strokeWidth="8"
          r={radius}
          cx="96"
          cy="96"
        />
        {/* Progress circle */}
        <circle
          className={cn(colorClasses.stroke, "transition-all duration-300 ease-in-out")}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx="96"
          cy="96"
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <span className={cn("text-4xl font-bold", colorClasses.text)}>{Math.round(percentage)}</span>
          <span className="ml-0.5 text-base font-medium text-neutral-500">/100</span>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-sm font-medium text-neutral-600">Grade</span>
          <span className={cn("text-lg font-semibold", colorClasses.text)}>{grade}</span>
        </div>
      </div>
    </div>
  );
}
