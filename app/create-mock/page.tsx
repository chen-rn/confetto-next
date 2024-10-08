import { prisma } from "@/lib/apis/prisma";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { StartMockInterviewButton } from "@/components/buttons/StartMockInterviewButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default async function CreateMockPage() {
  const userId = auth().userId;

  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  const questions = await prisma.question.findMany();

  return (
    <div className="container mx-auto p-4">
      <Link href={ROUTES.HOME}>
        <Button variant="outline" className="mb-6">
          Home
        </Button>
      </Link>
      <h1 className="text-xl font-bold mb-6">Pick a question:</h1>
      <ul className="space-y-4">
        {questions.map((question) => (
          <li
            key={question.id}
            className="p-4 bg-gray-100 rounded-xl flex justify-between items-center"
          >
            <p className="font-semibold text-sm mr-4 flex-grow">{question.content}</p>
            <StartMockInterviewButton questionId={question.id} userId={userId} />
          </li>
        ))}
      </ul>
    </div>
  );
}
