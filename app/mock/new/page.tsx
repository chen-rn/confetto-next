"use client";
import { Rocket, BookOpen, Library, ChevronLeft, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getRandomQuestion } from "@/lib/actions/question";
import { createMockInterview } from "@/lib/actions/createMockInterview";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { TopicSelectModal } from "@/components/modals/TopicSelectModal";
import { getRandomQuestionByTag } from "@/lib/actions/question";

export default function NewMockInterviewPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  async function handleStartMock() {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const randomQuestion = await getRandomQuestion();
    if (!randomQuestion) {
      router.push("/mock/new");
      return;
    }

    const mockId = await createMockInterview(randomQuestion.id, userId);
    router.push(ROUTES.MOCK(mockId));
  }

  async function handleTopicSelect(tagId: string) {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const question = await getRandomQuestionByTag(tagId);
    if (!question) {
      console.log("no questions found for this topic");
      return;
    }

    const mockId = await createMockInterview(question.id, userId);
    setIsTopicModalOpen(false);
    router.push(ROUTES.MOCK(mockId));
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col ">
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Center content vertically */}
        <div className="flex flex-col justify-center min-h-[calc(100vh-200px)] pb-14">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-3xl font-semibold text-gray-800">Start Interview</h1>
            <p className="text-gray-500">Choose your preferred practice mode to begin</p>
          </div>

          {/* Cards Grid */}
          <div className="max-w-5xl mx-auto w-full">
            <div className="grid gap-6 md:grid-cols-3">
              <InterviewOption
                onClick={handleStartMock}
                icon={Rocket}
                title="Quick Start"
                description="Jump right in with a random high-quality question"
                primaryText="Fastest way to practice"
                secondaryText="Random question selection"
              />

              <InterviewOption
                onClick={() => setIsTopicModalOpen(true)}
                icon={BookOpen}
                title="Pick a Topic"
                description="Focus your practice on specific areas"
                primaryText="Topic-focused practice"
                secondaryText="Targeted improvement"
              />

              <InterviewOption
                onClick={() => router.push("/question-bank")}
                icon={Library}
                title="Question Bank"
                description="Browse and select from our complete collection"
                primaryText="Full control"
                secondaryText="Choose any question"
              />
            </div>
          </div>
        </div>
      </div>

      <TopicSelectModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSelectTopic={handleTopicSelect}
      />
    </div>
  );
}

interface InterviewOptionProps {
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  primaryText: string;
  secondaryText: string;
}

function InterviewOption({
  onClick,
  icon: Icon,
  title,
  description,
  primaryText,
  secondaryText,
}: InterviewOptionProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "rounded-2xl",
        "relative p-6 transition-all duration-200",
        "hover:shadow-md cursor-pointer",
        "border hover:border-primary/20",
        "flex flex-col h-full"
      )}
    >
      {/* Icon and Title Section */}
      <div className="space-y-6">
        <div className="rounded-lg bg-primary/5 p-3 w-fit">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-gray-600">{primaryText}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-gray-600">{secondaryText}</span>
        </div>
      </div>
    </Card>
  );
}
