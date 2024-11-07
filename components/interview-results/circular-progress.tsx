import { cn } from "@/lib/utils";

interface CircularProgressProps {
  percentage: number;
  grade: string;
  className?: string;
}

export function CircularProgress({ percentage, grade, className }: CircularProgressProps) {
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative h-48 w-48", className)}>
      <svg className="h-full w-full -rotate-90 transform">
        {/* Background circle */}
        <circle
          className="stroke-[#635BFF]/10"
          fill="none"
          strokeWidth="8"
          r={radius}
          cx="96"
          cy="96"
        />
        {/* Progress circle */}
        <circle
          className="stroke-[#635BFF] transition-all duration-300 ease-in-out"
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
          <span className="text-4xl font-bold text-[#635BFF]">{Math.round(percentage)}</span>
          <span className="ml-0.5 text-base font-medium text-neutral-500">/100</span>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-sm font-medium text-neutral-600">Grade</span>
          <span className="text-lg font-semibold text-[#635BFF]">{grade}</span>
        </div>
      </div>
    </div>
  );
}
