"use server";
import { prisma } from "@/lib/prisma";

export async function getTags() {
  const tags = await prisma.questionTag.findMany({
    where: {
      type: "TOPIC",
      questions: {
        some: {}, // Only return tags that have at least one question
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return tags;
}
