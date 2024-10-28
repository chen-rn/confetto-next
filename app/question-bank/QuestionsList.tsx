"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import type { Question, QuestionTag } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { getQuestions } from "@/lib/actions/questions";
import { useSearchParams } from "next/navigation";

interface QuestionWithTags extends Question {
  tags: QuestionTag[];
}

export function QuestionsList() {
  const searchParams = useSearchParams();
  const selectedTopics = searchParams.get("topics")?.split(",") || [];

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions", selectedTopics],
    queryFn: () => getQuestions(selectedTopics),
  });

  if (isLoading) {
    return <QuestionsListSkeleton />;
  }

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="max-w-sm mx-auto space-y-4">
          <h3 className="text-lg font-medium">No questions found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or add a new question to get started.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionWithTags }) {
  return (
    <Card className="hover:shadow-sm transition-shadow duration-200">
      <div className="p-4 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2.5">
            <h3 className="text-base font-medium leading-tight line-clamp-2">{question.content}</h3>
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
          <Button size="sm" className="shrink-0 h-8 px-3" variant="outline">
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
