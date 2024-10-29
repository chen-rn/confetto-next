"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface StartMockInterviewParams {
  userId: string;
  questionId: string;
}

export async function startMockInterview({ userId, questionId }: StartMockInterviewParams) {
  // Create a new mock interview
  const mockInterview = await prisma.mockInterview.create({
    data: {
      userId,
      questionId,
    },
  });

  return mockInterview;
}

export async function getInterviewCount() {
  const { userId } = await auth();
  if (!userId) return 0;

  const count = await prisma.mockInterview.count({
    where: {
      userId,
      recordingUrl: {
        not: null,
      },
    },
  });

  return count;
}
