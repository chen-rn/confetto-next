"use server";

import { prisma } from "../prisma";

export async function getPrompts() {
  return prisma.feedbackPrompt.findMany();
}

export async function updatePrompt(id: string, prompt: string) {
  return prisma.feedbackPrompt.update({
    where: { id },
    data: { prompt },
  });
}
