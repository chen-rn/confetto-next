"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { Question, QuestionTag } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getQuestions } from "@/lib/actions/questions";
import { useSearchParams } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ServerFilters } from "./ServerFilters";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface QuestionWithTags extends Question {
  tags: QuestionTag[];
}

interface QuestionsResponse {
  questions: QuestionWithTags[];
  hasMore: boolean;
  total: number;
}

export function QuestionsList() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const searchParams = useSearchParams();
  const selectedTopics = searchParams.get("topics")?.split(",") || [];

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<QuestionsResponse>({
      queryKey: ["questions", selectedTopics],
      queryFn: ({ pageParam = 1 }) => getQuestions(selectedTopics, pageParam as number),
      getNextPageParam: (lastPage) => {
        if (!lastPage.hasMore) return undefined;
        return lastPage.questions.length / 50 + 1;
      },
      initialPageParam: 1,
    });

  const questions = data?.pages.flatMap((page) => page.questions) ?? [];

  return (
    <div>
      {/* Filters Section */}
      <Collapsible
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        className="border-b border-border"
      >
        <div className="px-6 py-4 flex items-center justify-between bg-secondary/40">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium">Filters</h3>
            {selectedTopics.length > 0 && (
              <Badge variant="secondary">{selectedTopics.length} selected</Badge>
            )}
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", {
                  "transform rotate-180": isFiltersOpen,
                })}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-6 py-4 border-t border-border bg-secondary/20">
            <ServerFilters />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Questions List */}
      <div className="p-6">
        {isLoading ? (
          <QuestionsListSkeleton />
        ) : questions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Questions"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="max-w-sm mx-auto space-y-4">
        <h3 className="text-lg font-medium">No questions found</h3>
        <p className="text-sm text-gray-500">
          Try adjusting your filters or add a new question to get started.
        </p>
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionWithTags }) {
  return (
    <Card className="transition-shadow duration-200 shadow-none">
      <div className="p-4 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2.5">
            <h3 className="text-base font-medium leading-tight">{question.content}</h3>
            <div className="flex flex-wrap gap-1.5">
              {question.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Link href={`${ROUTES.START_INTERVIEW}?questionId=${question.id}`}>
          <Button size="sm" className="shrink-0 h-8 px-3" variant="default">
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Practice
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function QuestionsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
