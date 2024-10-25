import { prisma } from "@/lib/apis/prisma";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { StartMockInterviewButton } from "@/components/buttons/StartMockInterviewButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { QuestionFilters } from "./QuestionFilters";
import { QuestionsList } from "./QuestionsList";

export default async function CreateMockPage() {
  const userId = auth().userId;

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

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

  // Get all unique tags for filtering
  const allTags = await prisma.questionTag.findMany();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Link href={ROUTES.HOME}>
          <Button variant="outline">Home</Button>
        </Link>
        <h1 className="text-2xl font-bold">Practice Questions</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <QuestionFilters tags={allTags} />
        </div>

        {/* Questions List */}
        <div className="lg:col-span-3">
          <QuestionsList questions={questions} userId={userId} />
        </div>
      </div>

      <div className="mt-8 pt-8 border-t">
        <h2 className="text-lg font-semibold mb-4">Add a new question:</h2>
        <AddQuestionForm />
      </div>
    </div>
  );
}
