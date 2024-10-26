"use client";

import { StartMockInterviewButton } from "@/components/buttons/StartMockInterviewButton";
import { Card } from "@/components/ui/card";
import type { Question, QuestionTag } from "@prisma/client";

interface QuestionsListProps {
  questions: (Question & { tags: QuestionTag[] })[];
  userId: string;
}

export function QuestionsList({ questions, userId }: QuestionsListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id} className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
              <p className="font-medium mb-2">{question.content}</p>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <span key={tag.id} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            <StartMockInterviewButton questionId={question.id} userId={userId} />
          </div>
        </Card>
      ))}

      {questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No questions found matching the selected filters.
        </div>
      )}
    </div>
  );
}
