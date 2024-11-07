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

export function ComponentSection({ component }: ComponentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = (component.score / component.total) * 100;

  return (
    <div className="rounded-xl border border-neutral-150 bg-white shadow-sm transition-all hover:border-[#635BFF]/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-4 p-5"
      >
        <div className="flex-1 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-700">{component.name}</span>
            <span className="text-sm text-muted-foreground">
              {component.score}/{component.total}
            </span>
          </div>
          <Progress
            value={percentage}
            className="h-2 bg-[#635BFF]/10"
            indicatorClassName="bg-gradient-to-r from-[#635BFF] to-[#635BFF]/80"
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
