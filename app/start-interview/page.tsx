import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ROUTES } from "@/lib/routes";
import { prisma } from "@/lib/prisma";
import { startMockInterview } from "@/lib/actions/mock-interviews";

export default async function StartInterviewPage(
  props: {
    searchParams: Promise<{ questionId?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.SIGN_IN);

  const questionId = searchParams.questionId;
  if (!questionId) redirect(ROUTES.QUESTION_BANK);

  // Verify the question exists
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) redirect(ROUTES.QUESTION_BANK);

  // Create a new mock interview session
  const mockInterview = await startMockInterview({
    userId,
    questionId,
  });

  // Redirect to the interview room
  redirect(`${ROUTES.MOCK}/${mockInterview.id}`);
}
