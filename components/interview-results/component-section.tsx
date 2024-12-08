"use client";
import { ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Component {
  name: string;
  score: number;
  total: number;
  summary: string;
}

interface ComponentSectionProps {
  component: Component;
}

function getScoreColorClasses(percentage: number): { bg: string; text: string; progressBg: string } {
  if (percentage > 85) {
    return {
      bg: "bg-green-500",
      text: "text-green-500",
      progressBg: "bg-green-100"
    };
  } else if (percentage >= 70) {
    return {
      bg: "bg-yellow-500",
      text: "text-yellow-500",
      progressBg: "bg-yellow-100"
    };
  } else if (percentage >= 50) {
    return {
      bg: "bg-gray-500",
      text: "text-gray-500",
      progressBg: "bg-gray-100"
    };
  } else {
    return {
      bg: "bg-red-500",
      text: "text-red-500",
      progressBg: "bg-red-100"
    };
  }
}

export function ComponentSection({ component }: ComponentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = (component.score / component.total) * 100;
  const colorClasses = getScoreColorClasses(percentage);

  return (
    <div className="rounded-xl border border-neutral-150 bg-white shadow-sm transition-all hover:border-neutral-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-4 p-5"
      >
        <div className="flex-1 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-700">{component.name}</span>
            <span className="text-sm text-muted-foreground">
              {component.score}/{component.total} ({Math.round(percentage)}%)
            </span>
          </div>
          <Progress
            value={percentage}
            className={cn("h-2", colorClasses.progressBg)}
            indicatorClassName={colorClasses.bg}
          />
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && (
        <div className="border-t border-neutral-100 bg-neutral-50/50 p-5">
          <p className="text-sm leading-relaxed text-neutral-600">{component.summary}</p>
        </div>
      )}
    </div>
  );
}
