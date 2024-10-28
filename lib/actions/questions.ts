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

export async function getQuestions(topics: string[]) {
  const questions = await prisma.question.findMany({
    where: {
      ...(topics.length > 0
        ? {
            tags: {
              some: {
                name: {
                  in: topics,
                },
              },
            },
          }
        : {}),
    },
    include: {
      tags: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return questions;
}
