"use server";
import { prisma } from "@/lib/prisma";
import type { TagType } from "@prisma/client";

export async function getTags() {
  const tags = await prisma.questionTag.findMany({
    where: {
      type: "TOPIC" as TagType,
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
