"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/lib/actions/questions";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getTagStyles } from "./utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ServerFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedTopics = searchParams.get("topics")?.split(",") || [];

  // Local state for optimistic updates
  const [localSelectedTopics, setLocalSelectedTopics] = useState(selectedTopics);

  const { data: topics = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => getTags(),
  });

  // Filter out topics with no questions
  const activeTopics = topics.filter((topic) => topic._count.questions > 0);

  const updateFilters = (topicId: string) => {
    const newTopics = localSelectedTopics.includes(topicId)
      ? localSelectedTopics.filter((id) => id !== topicId)
      : [...localSelectedTopics, topicId];

    // Update local state immediately
    setLocalSelectedTopics(newTopics);

    // Update URL
    const params = new URLSearchParams(searchParams);
    if (newTopics.length > 0) {
      params.set("topics", newTopics.join(","));
    } else {
      params.delete("topics");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {activeTopics.map((topic) => {
        const isSelected = localSelectedTopics.includes(topic.name);

        return (
          <button
            key={topic.id}
            onClick={() => updateFilters(topic.name)}
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl transition-all w-full text-left",
              "hover:bg-[#635BFF]/5 active:bg-[#635BFF]/10",
              "border border-transparent",
              isSelected && "border-[#635BFF]/20 bg-[#635BFF]/5"
            )}
          >
            <Checkbox
              id={topic.id}
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "transition-colors shrink-0",
                "border-[#635BFF]/30 data-[state=checked]:bg-[#635BFF] data-[state=checked]:border-[#635BFF]"
              )}
            />
            <div className="flex flex-1 items-center justify-between min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-normal leading-tight text-neutral-700 truncate">
                      {topic.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px]">
                    {topic.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2 shrink-0 border-transparent rounded-lg",
                  getTagStyles(topic.name)
                )}
              >
                {topic._count.questions}
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}
