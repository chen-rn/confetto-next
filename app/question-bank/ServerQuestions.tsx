import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Question, QuestionTag } from "@prisma/client";
import { PracticeQuestionButton } from "@/components/buttons/PracticeQuestionButton";

interface QuestionWithTags extends Question {
  tags: QuestionTag[];
}

interface ServerQuestionsProps {
  userId: string;
  searchParams?: {
    topics?: string;
  };
}

export async function ServerQuestions({ userId, searchParams }: ServerQuestionsProps) {
  const selectedTopics = searchParams?.topics?.split(",") || [];

  const questions = await prisma.question.findMany({
    where: {
      ...(selectedTopics.length > 0
        ? {
            tags: {
              some: {
                name: {
                  in: selectedTopics,
                },
              },
            },
          }
        : {}),
    },
    include: {
      tags: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
        <PracticeQuestionButton questionId={question.id} className="shrink-0 h-8 px-3" />
      </div>
    </Card>
  );
}
