"use server";

import { prisma } from "@/lib/prisma";

export async function getMockInterview(mockId: string) {
  return prisma.mockInterview.findUnique({
    where: { id: mockId },
    include: {
      feedback: true,
      question: true,
    },
  });
}
