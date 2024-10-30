"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Rocket, BookOpen, Library } from "lucide-react";
import { TopicSelectModal } from "@/components/modals/TopicSelectModal";
import { InterviewOption } from "./InterviewOption";
import { getRandomQuestion, getRandomQuestionByTag } from "@/lib/actions/question";
import { createMockInterview } from "@/lib/actions/createMockInterview";
import { ROUTES } from "@/lib/routes";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useInterviewEligibility } from "@/lib/hooks/useInterviewEligibility";

const OPTIONS = [
  {
    icon: Rocket,
    title: "Quick Start",
    description: "Jump right in with a random high-quality question",
    primaryText: "Fastest way to practice",
    secondaryText: "Random question selection",
    action: "quickStart",
  },
  {
    icon: BookOpen,
    title: "Pick a Topic",
    description: "Focus your practice on specific areas",
    primaryText: "Topic-focused practice",
    secondaryText: "Targeted improvement",
    action: "topicSelect",
  },
  {
    icon: Library,
    title: "Question Bank",
    description: "Browse and select from our complete collection",
    primaryText: "Full control",
    secondaryText: "Choose any question",
    action: "questionBank",
  },
] as const;

export default function InterviewOptions() {
  const router = useRouter();
  const { userId } = useAuth();
  const { isEligible } = useInterviewEligibility();
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Pre-fetch a random question
  const { data: preloadedQuestion } = useQuery({
    queryKey: ["preloadedQuestion"],
    queryFn: () => getRandomQuestion(),
    refetchOnWindowFocus: false,
  });

  async function handleStartMock() {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (!isEligible) {
      router.push("/dashboard?showSubscription=true");
      return;
    }

    setIsStarting(true);
    try {
      const questionToUse = preloadedQuestion || (await getRandomQuestion());
      if (!questionToUse) {
        router.push("/mock/new");
        return;
      }

      const mockId = await createMockInterview(questionToUse.id, userId);
      router.push(`${ROUTES.MOCK}/${mockId}`);
    } catch (error) {
      console.error("Error starting mock interview:", error);
    }
  }

  async function handleTopicSelect(tagId: string) {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (!isEligible) {
      router.push("/dashboard?showSubscription=true");
      return;
    }

    const question = await getRandomQuestionByTag(tagId);
    if (!question) {
      console.log("no questions found for this topic");
      return;
    }

    const mockId = await createMockInterview(question.id, userId);
    setIsTopicModalOpen(false);
    router.push(`${ROUTES.MOCK}/${mockId}`);
  }

  function handleOptionSelect(action: (typeof OPTIONS)[number]["action"]) {
    switch (action) {
      case "quickStart":
        handleStartMock();
        break;
      case "topicSelect":
        setIsTopicModalOpen(true);
        break;
      case "questionBank":
        router.push("/question-bank");
        break;
    }
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {OPTIONS.map((option, index) => (
          <motion.div
            key={option.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InterviewOption
              onClick={() => handleOptionSelect(option.action)}
              icon={option.icon}
              title={option.title}
              description={option.description}
              primaryText={option.primaryText}
              secondaryText={option.secondaryText}
              isLoading={isStarting && index === 0}
            />
          </motion.div>
        ))}
      </div>

      <TopicSelectModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSelectTopic={handleTopicSelect}
      />
    </>
  );
}
