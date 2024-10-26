import { prisma } from "@/lib/apis/prisma";
import { QuestionsList } from "./QuestionsList";

interface ServerQuestionsProps {
  userId: string;
}

export async function ServerQuestions({ userId }: ServerQuestionsProps) {
  // Get user's school states
  const userSchools = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      schools: {
        select: { state: true },
      },
    },
  });

  const userStates = userSchools?.schools.map((school) => school.state) || [];

  // Get all questions and their tags
  const questions = await prisma.question.findMany({
    where: {
      OR: [
        { tags: { none: { type: "STATE" } } },
        {
          tags: {
            some: {
              type: "STATE",
              name: { in: userStates },
            },
          },
        },
      ],
    },
    include: {
      tags: true,
    },
  });

  return <QuestionsList questions={questions} userId={userId} />;
}
