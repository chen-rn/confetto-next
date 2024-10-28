"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/lib/actions/questions";
import { useState } from "react";

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
      {activeTopics.map((topic) => (
        <div key={topic.id} className="flex items-start gap-3">
          <Checkbox
            id={topic.id}
            checked={localSelectedTopics.includes(topic.name)}
            onCheckedChange={() => updateFilters(topic.name)}
            className="mt-0.5"
          />
          <div className="flex flex-1 items-center justify-between min-w-0">
            <Label htmlFor={topic.id} className="text-sm font-normal cursor-pointer leading-tight">
              {topic.name}
            </Label>
            <Badge variant="secondary" className="ml-2 shrink-0">
              {topic._count.questions}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
