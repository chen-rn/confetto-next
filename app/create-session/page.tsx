import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

async function createMockSession(formData: FormData) {
  "use server";

  const questionId = formData.get("questionId");
  const userId = formData.get("userId");

  if (!questionId || typeof questionId !== "string" || !userId || typeof userId !== "string") {
    throw new Error("Invalid question ID or user ID");
  }

  const createdSession = await prisma.practiceSession.create({
    data: {
      userId: userId,
      questionId: questionId,
      startTime: new Date(),
    },
  });

  const practiceSessionId = createdSession.id;

  revalidatePath("/create-session");
  redirect(`/session/${practiceSessionId}`); // Redirect to the specific session page after creation
}

export default async function CreateSessionPage() {
  const questions = await prisma.question.findMany();
  const userId = auth().userId;

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Session</h1>
      <ul className="space-y-2">
        {questions.map((question) => (
          <li
            key={question.id}
            className="p-2 bg-gray-100 rounded flex justify-between items-center"
          >
            <p className="font-semibold">{question.content}</p>
            <form action={createMockSession}>
              <input type="hidden" name="questionId" value={question.id} />
              <input type="hidden" name="userId" value={userId} />
              <Button type="submit">Start Mock Interview</Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
