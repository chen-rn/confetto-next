import { prisma } from "@/lib/apis/prisma";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { StartMockInterviewButton } from "@/components/buttons/StartMockInterviewButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CreateMockPage() {
  const userId = auth().userId;

  if (!userId) {
    redirect("/sign-in");
  }

  const questions = await prisma.question.findMany();

  return (
    <div className="container mx-auto p-4">
      <Link href="/">
        <Button variant="outline">Home</Button>
      </Link>
      <h1 className="text-2xl font-bold mb-4">Start Mock Interview:</h1>
      <ul className="space-y-2">
        {questions.map((question) => (
          <li
            key={question.id}
            className="p-2 bg-gray-100 rounded flex justify-between items-center"
          >
            <p className="font-semibold">{question.content}</p>
            <StartMockInterviewButton questionId={question.id} userId={userId} />
          </li>
        ))}
      </ul>
    </div>
  );
}
