"use server";

import { prisma } from "@/lib/prisma";

export async function addQuestion(content: string): Promise<void> {
  try {
    await prisma.question.create({
      data: {
        content,
      },
    });
  } catch (error) {
    console.error("Error adding question:", error);
    throw new Error("Failed to add question");
  }
}
