"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TagType } from "@prisma/client";
import { useQueryState } from "nuqs";
import { useTransition } from "react";

interface QuestionFiltersProps {
  tags: {
    id: string;
    name: string;
    type: TagType;
  }[];
}

export function QuestionFilters({ tags }: QuestionFiltersProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedTags, setSelectedTags] = useQueryState("tags");
  const selectedTagsArray = selectedTags?.split(",") || [];

  const toggleTag = (tagName: string) => {
    startTransition(() => {
      const tagsList = selectedTagsArray;
      const newTags = tagsList.includes(tagName)
        ? tagsList.filter((t) => t !== tagName)
        : [...tagsList, tagName];

      setSelectedTags(newTags.length > 0 ? newTags.join(",") : null);
    });
  };

  // Filter to only show TOPIC tags
  const topicTags = tags.filter((tag) => tag.type === "TOPIC");

  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4">Filter by Topic</h2>
      <div className="flex flex-wrap gap-2">
        {topicTags.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTagsArray.includes(tag.name) ? "default" : "outline"}
            className={`cursor-pointer hover:bg-primary/90 transition-colors
              ${isPending ? "opacity-50" : "opacity-100"}`}
            onClick={() => toggleTag(tag.name)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
