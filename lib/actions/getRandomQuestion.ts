"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getRandomQuestion() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  try {
    const questionCount = await prisma.question.count();
    const skip = Math.floor(Math.random() * questionCount);
    const randomQuestion = await prisma.question.findFirst({
      skip: skip,
      take: 1,
    });

    if (!randomQuestion) {
      throw new Error("No questions found");
    }

    // Create a new mock
    const newMock = await prisma.mockInterview.create({
      data: {
        userId,
        questionId: randomQuestion.id,
      },
    });

    return { mockId: newMock.id };
  } catch (error) {
    console.error("Error creating quick mock:", error);
    throw new Error("Failed to create quick mock");
  }
}
