"use server";

import { prisma } from "@/lib/prisma";

export async function getTags() {
  const tags = await prisma.questionTag.findMany({
    where: {
      type: "TOPIC",
    },
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  return tags;
}

export async function getQuestions(topics: string[] = [], page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  const where = topics.length > 0 ? { tags: { some: { name: { in: topics } } } } : {};

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        tags: true,
      },
      take: limit,
      skip,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.question.count({ where }),
  ]);

  return {
    questions,
    hasMore: skip + questions.length < total,
    total,
  };
}
