"use client";
import { Rocket, BookOpen, Library, ChevronLeft, LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
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
      // Handle no questions found for this topic
      console.log("no questions found for this topic");
      return;
    }

    const mockId = await createMockInterview(question.id, userId);
    setIsTopicModalOpen(false);
    router.push(ROUTES.MOCK(mockId));
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 h-screen relative">
      <Link href="/dashboard" className="absolute top-8 left-8">
        <Button variant="secondary" className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </Link>

      <div className="w-full max-w-5xl space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Start Mock Interview</h1>
          <p className="text-muted-foreground text-lg">Choose your interview mode</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:wegap-12">
          <InterviewOption
            onClick={handleStartMock}
            icon={Rocket}
            title="Quick Start"
            description="Jump right in with a random high-quality question"
          />

          <InterviewOption
            onClick={() => {
              setIsTopicModalOpen(true);
              console.log("hihihih onclikc");
            }}
            icon={BookOpen}
            title="Pick a Topic"
            description="Choose from our curated topic categories"
          />

          <InterviewOption
            onClick={() => {
              router.push("/question-bank");
            }}
            icon={Library}
            title="Question Bank"
            description="Browse and select from all available questions"
          />
        </div>

        <TopicSelectModal
          isOpen={isTopicModalOpen}
          onClose={() => setIsTopicModalOpen(false)}
          onSelectTopic={handleTopicSelect}
        />
      </div>
    </div>
  );
}

interface InterviewOptionProps {
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
}

function InterviewOption({ onClick, icon: Icon, title, description }: InterviewOptionProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        "border-[1.5px] hover:border-primary/50 group",
        "bg-card/50 backdrop-blur-sm"
      )}
    >
      <CardHeader className="space-y-8 p-8">
        <div className="flex justify-center">
          <Icon
            size={52}
            className="text-primary/75 group-hover:text-primary transition-colors duration-300"
          />
        </div>
        <div className="space-y-3 text-center">
          <h2 className="font-bold text-2xl tracking-tight">{title}</h2>
          <CardDescription className="text-sm">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
