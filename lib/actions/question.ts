"use server";
import { prisma } from "@/lib/prisma";

export async function getRandomQuestion() {
  // Get a random question from the database
  const questionsCount = await prisma.question.count();
  const skip = Math.floor(Math.random() * questionsCount);
  const question = await prisma.question.findFirst({
    skip,
    take: 1,
  });

  return question;
}

export async function getRandomQuestionByTag(tagId: string) {
  // First get the count of matching questions
  const matchingQuestionsCount = await prisma.question.count({
    where: {
      tags: {
        some: {
          id: tagId,
        },
      },
    },
  });

  // Get a random skip value
  const skip = Math.floor(Math.random() * matchingQuestionsCount);

  const question = await prisma.question.findFirst({
    where: {
      tags: {
        some: {
          id: tagId,
        },
      },
    },
    skip,
    take: 1,
  });

  return question;
}
